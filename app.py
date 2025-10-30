# app.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import cv2 as cv
import numpy as np
import matplotlib.pyplot as plt
import io # Para lidar com a imagem recebida em memória
import traceback # Importar para obter o stack trace de erros

app = FastAPI()

@app.post("/api/analyze-corrosion/")
async def analyze_corrosion(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        print("Erro: O arquivo enviado não é uma imagem.") # Log
        raise HTTPException(status_code=400, detail="O arquivo enviado não é uma imagem.")

    try:
        # Ler a imagem diretamente do stream
        contents = await file.read()
        print(f"Conteúdo do arquivo recebido. Tamanho: {len(contents)} bytes.") # ADDED LOG
        np_img = np.frombuffer(contents, np.uint8)
        print("Attempting to decode image with cv.imdecode...")
        img = cv.imdecode(np_img, cv.IMREAD_COLOR)
        print(f"Resultado de cv.imdecode: {type(img)}") # ADDED LOG

        if img is None:
            print("Erro: cv.imdecode retornou None. Não foi possível decodificar a imagem.") # Modified Log
            raise HTTPException(status_code=400, detail="Não foi possível decodificar a imagem.")

        # ADDED LOG to confirm image properties
        print(f"Imagem decodificada com sucesso. Dimensões: {img.shape}, Tipo de dados: {img.dtype}")

        # --- SEU CÓDIGO DE ANÁLISE DE CORROSÃO A PARTIR DAQUI ---
        print("Imagem decodificada com sucesso. Iniciando análise...") # Log

        # Converter para HSV separando matiz, saturação e valor (melhor para limiares de cor)
        hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)

        # Criar máscara do fundo (fundo verde)
        lower = np.array([80, 85, 20], np.uint8)
        upper = np.array([90, 255, 255], np.uint8)
        mascara_fundo = cv.inRange(hsv, lower, upper)
        print(f"Mascara de fundo criada. Pixels no fundo: {np.count_nonzero(mascara_fundo)}") # Log

        mascara_objeto = cv.bitwise_not(mascara_fundo)

        kernel = np.ones((5, 5), np.uint8)
        mascara_objeto = cv.morphologyEx(mascara_objeto, cv.MORPH_OPEN, kernel)
        mascara_objeto = cv.morphologyEx(mascara_objeto, cv.MORPH_CLOSE, kernel)
        print(f"Mascara de objeto após morfologia. Pixels no objeto: {np.count_nonzero(mascara_objeto)}") # Log


        contornos, _ = cv.findContours(mascara_objeto, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

        if not contornos:
            print("Erro: Nenhum objeto principal detectado na imagem.") # Log
            return JSONResponse(status_code=400, content={"message": "Nenhum objeto principal detectado na imagem."})

        maior = max(contornos, key=cv.contourArea)
        mascara_limpa = np.zeros_like(mascara_objeto)
        cv.drawContours(mascara_limpa, [maior], -1, 255, cv.FILLED)
        print(f"Objeto principal isolado. Pixels no parafuso isolado: {np.count_nonzero(mascara_limpa)}") # Log


        # Aplicar máscara na imagem
        isolado = cv.bitwise_and(img, img, mask=mascara_limpa)

        # Converter para HSV novamente para análise de corrosão no objeto isolado
        hsv_isolado = cv.cvtColor(isolado, cv.COLOR_BGR2HSV)

        # Limiar da CORROSÃO
        lower_verm = np.array([5, 80, 60], np.uint8)
        upper_verm = np.array([16, 255, 255], np.uint8)

        lower_preto = np.array([0, 0, 0], np.uint8)
        upper_preto = np.array([200, 255, 60], np.uint8)

        lower_branco = np.array([0, 0, 180], np.uint8)
        upper_branco = np.array([50, 60, 255], np.uint8)

        mascara_vermelho = cv.inRange(hsv_isolado, lower_verm, upper_verm)
        mascara_preta = cv.inRange(hsv_isolado, lower_preto, upper_preto)
        mascara_branco = cv.inRange(hsv_isolado, lower_branco, upper_branco)

        mascara_corrosao_total = np.zeros_like(mascara_limpa)
        mascara_corrosao_total = cv.bitwise_or(mascara_corrosao_total, mascara_vermelho)
        mascara_corrosao_total = cv.bitwise_or(mascara_corrosao_total, mascara_preta)
        mascara_corrosao_total = cv.bitwise_or(mascara_corrosao_total, mascara_branco)

        mascara_vermelho_parafuso = cv.bitwise_and(mascara_vermelho, mascara_limpa)
        mascara_preta_parafuso = cv.bitwise_and(mascara_preta, mascara_limpa)
        mascara_branco_parafuso = cv.bitwise_and(mascara_branco, mascara_limpa)
        mascara_corrosao_total_parafuso = cv.bitwise_and(mascara_corrosao_total, mascara_limpa)


        total_parafuso = int(np.count_nonzero(mascara_limpa))
        print(f"Total de pixels do parafuso para cálculo: {total_parafuso}") # Log

        if total_parafuso == 0:
            print("Erro: Parafuso detectado com área zero de pixels.") # Log
            return JSONResponse(status_code=400, content={"message": "Parafuso detectado, mas com área zero de pixels. Verifique a imagem."})

        pixels_corrosao_vermelha = int(np.count_nonzero(mascara_vermelho_parafuso))
        percentual_vermelha = (pixels_corrosao_vermelha / total_parafuso) * 100.0 if total_parafuso > 0 else 0.0

        pixels_corrosao_preta = int(np.count_nonzero(mascara_preta_parafuso))
        percentual_preta = (pixels_corrosao_preta / total_parafuso) * 100.0 if total_parafuso > 0 else 0.0

        pixels_corrosao_branca = int(np.count_nonzero(mascara_branco_parafuso))
        percentual_branca = (pixels_corrosao_branca / total_parafuso) * 100.0 if total_parafuso > 0 else 0.0

        pixels_corrosao_total_calculated = int(np.count_nonzero(mascara_corrosao_total_parafuso))
        percentual_total_afetado = (pixels_corrosao_total_calculated / total_parafuso) * 100.0 if total_parafuso > 0 else 0.0

        print(f"Resultados calculados: Total={percentual_total_afetado:.2f}%, Vermelha={percentual_vermelha:.2f}%, Preta={percentual_preta:.2f}%, Branca={percentual_branca:.2f}%") # Log


        return JSONResponse(content={
            "percentual_total_afetado": round(percentual_total_afetado, 2),
            "percentual_vermelha": round(percentual_vermelha, 2),
            "percentual_preta": round(percentual_preta, 2),
            "percentual_branca": round(percentual_branca, 2)
        })

    except Exception as e:
        # Imprime o stack trace completo do erro no console do servidor
        print(f"Erro interno do servidor na análise de corrosão: {e}")
        traceback.print_exc() # Isso mostrará onde o erro ocorreu
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")