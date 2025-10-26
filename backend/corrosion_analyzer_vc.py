# backend/corrosion_analyzer_vc.py
import cv2 as cv
import numpy as np
import io

def analyze_corrosion(image_path_or_bytes):
    """
    Analisa a corrosão em uma imagem de parafuso.
    Recebe o caminho para a imagem ou os bytes da imagem.
    Retorna um dicionário com os percentuais de corrosão.
    """
    if isinstance(image_path_or_bytes, str):
        img = cv.imread(image_path_or_bytes)
    elif isinstance(image_path_or_bytes, bytes):
        nparr = np.frombuffer(image_path_or_bytes, np.uint8)
        img = cv.imdecode(nparr, cv.IMREAD_COLOR)
    else:
        raise ValueError("A entrada deve ser um caminho de arquivo ou bytes da imagem.")

    if img is None:
        raise ValueError("Não foi possível carregar a imagem.")

    # --- Seu código de VC adaptado ---
    hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)

    # Criar máscara do fundo (fundo verde)
    lower = np.array([80, 85, 20], np.uint8) # Ajuste estes valores para o tom de verde específico
    upper = np.array([90, 255, 255], np.uint8) # Ajuste estes valores para o tom de verde específico
    mascara_fundo = cv.inRange(hsv, lower, upper)

    # Inverter máscara para obter objeto
    mascara_objeto = cv.bitwise_not(mascara_fundo)

    # Limpar máscara com morfologia
    kernel = np.ones((5, 5), np.uint8)
    mascara_objeto = cv.morphologyEx(mascara_objeto, cv.MORPH_OPEN,  kernel)
    mascara_objeto = cv.morphologyEx(mascara_objeto, cv.MORPH_CLOSE, kernel)

    # Obter maior contorno
    contornos, _ = cv.findContours(mascara_objeto, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    if not contornos: # Se não encontrar contornos, retorna 0%
        return {
            "percentual_total_afetado": 0.0,
            "percentual_vermelha": 0.0,
            "percentual_preta": 0.0,
            "percentual_branca": 0.0
        }

    maior = max(contornos, key=cv.contourArea)
    mascara_limpa = np.zeros_like(mascara_objeto)
    cv.drawContours(mascara_limpa, [maior], -1, 255, cv.FILLED)

    # Aplicar máscara na imagem para isolar o parafuso
    isolado = cv.bitwise_and(img, img, mask=mascara_limpa)

    # Converter para HSV novamente para análise de corrosão no parafuso isolado
    hsv_isolado = cv.cvtColor(isolado, cv.COLOR_BGR2HSV)

    corrosao_vermelha = True
    corrosao_preta   = True
    corrosao_branca  = True

    # Vermelho - modificar a matiz (H)
    lower_verm = np.array([5, 80, 60], np.uint8)
    upper_verm = np.array([16, 255, 255], np.uint8)

    # Preto - focar no V baixo
    lower_preto = np.array([0, 0, 0], np.uint8)
    upper_preto = np.array([200, 255, 60], np.uint8)

    # Branco/Claro — V alto e S baixo (baixa saturação = aparência esbranquiçada)
    lower_branco = np.array([0, 0, 180], np.uint8) # Ajustado V para ser mais alto
    upper_branco = np.array([50, 60, 255], np.uint8)

    # Criar máscaras individuais para cada tipo de corrosão
    mascara_vermelho = np.zeros(hsv_isolado.shape[:2], dtype=np.uint8)
    mascara_preta = np.zeros(hsv_isolado.shape[:2], dtype=np.uint8)
    mascara_branco = np.zeros(hsv_isolado.shape[:2], dtype=np.uint8)

    if corrosao_vermelha:
        mascara_vermelho = cv.inRange(hsv_isolado, lower_verm, upper_verm)

    if corrosao_preta:
        mascara_preta = cv.inRange(hsv_isolado, lower_preto, upper_preto)

    if corrosao_branca:
        mascara_branco = cv.inRange(hsv_isolado, lower_branco, upper_branco)

    # Combinar máscaras para visualização geral (opcional) e cálculo total
    mascara_corrosao_total = np.zeros(hsv_isolado.shape[:2], dtype=np.uint8)
    mascara_corrosao_total = cv.bitwise_or(mascara_corrosao_total, mascara_vermelho)
    mascara_corrosao_total = cv.bitwise_or(mascara_corrosao_total, mascara_preta)
    mascara_corrosao_total = cv.bitwise_or(mascara_corrosao_total, mascara_branco)

    # Calcular a proporção de cada nível de corrosão
    total_parafuso_pixels = int(np.count_nonzero(mascara_limpa))

    if total_parafuso_pixels == 0:
        return {
            "percentual_total_afetado": 0.0,
            "percentual_vermelha": 0.0,
            "percentual_preta": 0.0,
            "percentual_branca": 0.0
        }

    pixels_corrosao_vermelha = int(np.count_nonzero(mascara_vermelho))
    percentual_vermelha = (pixels_corrosao_vermelha / total_parafuso_pixels) * 100.0

    pixels_corrosao_preta = int(np.count_nonzero(mascara_preta))
    percentual_preta = (pixels_corrosao_preta / total_parafuso_pixels) * 100.0

    pixels_corrosao_branca = int(np.count_nonzero(mascara_branco))
    percentual_branca = (pixels_corrosao_branca / total_parafuso_pixels) * 100.0

    pixels_corrosao_total = int(np.count_nonzero(mascara_corrosao_total))
    percentual_total_afetado = (pixels_corrosao_total / total_parafuso_pixels) * 100.0

    return {
        "percentual_total_afetado": round(percentual_total_afetado, 2),
        "percentual_vermelha": round(percentual_vermelha, 2),
        "percentual_preta": round(percentual_preta, 2),
        "percentual_branca": round(percentual_branca, 2)
    }