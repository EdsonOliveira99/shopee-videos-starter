# Automação (o que existe no sistema)

- `FAZER-TUDO.bat` → `scripts\v2\fazer-tudo.mjs`: narração (até 3 tentativas) → render → confere os .mp4 → limpa `Downloads\_Shopee-Videos-ja-usados` se deu tudo certo. Log em `logs\`; resumo em `VIDEOS-PRONTOS\ULTIMA-EXECUCAO.txt`. `--teste` simula.
- `AGENDAR-MADRUGADA.bat` cria a tarefa "Shopee-FazerTudo" no horário de `conta.json` → `agendamento.hora` (PC ligado ou em suspensão); `DESAGENDAR-MADRUGADA.bat` remove.
- `scripts\v2\config.json`: `pastaDrive` (vazio = não copia; use se quiser copiar os vídeos para uma pasta do Google Drive), `pastaUsados`, tentativas.
- Segurança: antes de mudar código, commit no git; `VOLTAR-VERSAO-ESTAVEL.bat` volta o código para a versão estável (usa `_BACKUPS\versao-estavel-codigo.zip`, criado pelo `1-INSTALAR.bat`).
- Anti-robô: não abrir shopee.com.br; tudo pelo painel de afiliado. Se aparecer verificação, parar.
- Detector de rosto: OpenCV FaceDetectorYN + modelo YuNet (opencv_zoo, face_detection_yunet_2023mar.onnx).
