import cv2
import numpy as np

print(f"Versão do OpenCV: {cv2.__version__}")
print(f"Caminho do módulo cv2: {cv2.__file__}")

if hasattr(cv2, 'imdecode'):
    print("cv2.imdecode encontrado.")
else:
    print("ERRO: cv2.imdecode NÃO encontrado.")

if hasattr(cv2, 'morphEx'):
    print("cv2.morphEx encontrado.")
else:
    print("ERRO: cv2.morphEx NÃO encontrado.")

if hasattr(cv2, 'MORPH_OPEN'):
    print("cv2.MORPH_OPEN encontrado.")
else:
    print("ERRO: cv2.MORPH_OPEN NÃO encontrado.")

try:
    # Tenta uma operação básica para ver se o módulo funciona
    dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
    kernel = np.ones((5,5),np.uint8)
    result = cv2.morphEx(dummy_img, cv2.MORPH_OPEN, kernel)
    print("Teste de morphEx bem-sucedido!")
except AttributeError as e:
    print(f"AttributeError durante o teste de morphEx: {e}")
except Exception as e:
    print(f"Outro erro durante o teste de morphEx: {e}")