# backend/main.py
from flask import Flask, request, jsonify
from flask_cors import CORS # Para lidar com CORS no Vercel
from pymongo import MongoClient
from datetime import datetime
import os
import tempfile
from bson import ObjectId

# Importa a função de análise de corrosão
from corrosion_analyzer_vc import analyze_corrosion

app = Flask(__name__)
CORS(app) # Habilita CORS para todas as rotas

# Configuração do MongoDB (use variáveis de ambiente no Vercel)
# A string de conexão do MongoDB Atlas será algo como:
# mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority
MONGO_URI = os.environ.get("MONGO_URI")
if not MONGO_URI:
    print("Warning: MONGO_URI environment variable not set. Using local MongoDB.")
    MONGO_URI = "mongodb://localhost:27017/"

try:
    client = MongoClient(MONGO_URI)
    db = client.unotechia_db # Nome do seu banco de dados no Atlas
    para_collection = db.para_collection
    analises_collection = db.analises_collection
    print("Conexão com MongoDB estabelecida.")
except Exception as e:
    print(f"Erro ao conectar ao MongoDB: {e}")
    # Opcional: tratar o erro ou sair da aplicação se a conexão for crítica

# Rotas do Parafuso
@app.route('/api/parafusos', methods=['POST'])
def add_parafuso():
    try:
        data = request.get_json()
        if not data or 'codigo' not in data:
            return jsonify({"error": "Código do parafuso é obrigatório"}), 400

        parafuso = {
            "codigo": data['codigo'],
            "dataRegistro": datetime.now().isoformat()
        }
        # Garante que o ID do MongoDB seja uma string ao retornar
        result = para_collection.insert_one(parafuso)
        parafuso['id'] = str(result.inserted_id)
        return jsonify(parafuso), 201
    except Exception as e:
        print(f"Erro ao adicionar parafuso: {e}")
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@app.route('/api/parafusos', methods=['GET'])
def get_parafusos():
    try:
        parafusos = []
        for p in para_collection.find():
            p['id'] = str(p['_id']) # Converte ObjectId para string
            del p['_id'] # Remove o campo original
            parafusos.append(p)
        return jsonify(parafusos), 200
    except Exception as e:
        print(f"Erro ao buscar parafusos: {e}")
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# Rota de Análise com IA
@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({"error": "Nenhuma imagem enviada"}), 400

    file = request.files['image']
    parafuso_id = request.form.get('parafusoId')
    observacoes = request.form.get('observacoes', '')
    responsavel = request.form.get('responsavel')

    if not parafuso_id or not responsavel:
        return jsonify({"error": "ID do parafuso e Responsável são obrigatórios"}), 400

    if file.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400

    try:
        # Lê os bytes da imagem diretamente
        image_bytes = file.read()

        # Chama sua função de VC
        results_vc = analyze_corrosion(image_bytes)
        # results_vc deve conter: {"percentual_total_afetado": ..., "percentual_vermelha": ..., etc.}

        # Salva os resultados no MongoDB
        analise_data = {
            "parafusoId": parafuso_id,
            "percentualAfetado": results_vc.get("percentual_total_afetado", 0.0), # Usando o total para o campo existente
            "detalhesCorrosao": results_vc, # Armazena os detalhes completos
            "observacoes": observacoes,
            "dataAnalise": datetime.now().isoformat(),
            "responsavel": responsavel
        }
        result = analises_collection.insert_one(analise_data)
        analise_data['id'] = str(result.inserted_id)
        del analise_data['_id'] # Remove o campo original
        return jsonify(analise_data), 200

    except ValueError as ve:
        print(f"Erro na análise de VC: {ve}")
        return jsonify({"error": f"Erro na análise de imagem: {str(ve)}"}), 400
    except Exception as e:
        print(f"Erro geral na análise: {e}")
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

@app.route('/api/analises', methods=['GET'])
def get_analises():
    try:
        analises = []
        for a in analises_collection.find():
            a['id'] = str(a['_id']) # Converte ObjectId para string
            del a['_id'] # Remove o campo original
            analises.append(a)
        return jsonify(analises), 200
    except Exception as e:
        print(f"Erro ao buscar análises: {e}")
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

if __name__ == '__main__':
    # Para desenvolvimento local, o Vercel irá usar o `vercel.json`
    app.run(debug=True, port=5000)