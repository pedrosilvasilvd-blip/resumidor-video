# Backend gratuito para a Aba 4

O site principal continua hospedado no **GitHub Pages**. O serviço abaixo é usado somente para preparar os downloads de YouTube e Instagram. Você não precisa comprar uma API nem criar uma chave.

## Arquivos que devem ficar no repositório

```text
index.html
render.yaml
README-BACKEND.md
backend/
  Dockerfile
  start-render.sh
```

## Publicar no Render

1. Envie `render.yaml` e a pasta `backend` para a raiz do mesmo repositório do GitHub onde está o app.
2. Acesse **https://dashboard.render.com/** e entre com sua conta do GitHub.
3. Clique em **New > Blueprint**.
4. Selecione o repositório do app.
5. O Render encontrará o `render.yaml`. Clique em **Apply/Deploy**.
6. Aguarde o serviço `blind-engine-social-backend` ficar com o estado **Live**.
7. Abra o serviço e copie a URL pública exibida pelo Render, parecida com:

```text
https://blind-engine-social-backend.onrender.com
```

8. Volte à Aba 4 do app, abra **Conectar backend gratuito**, cole essa URL e clique em **Testar e salvar backend**.

Pronto. A URL fica salva no navegador; não existe chave de API.

## Listagem de perfis inteiros

O backend inclui a rota `/profile`, que lista canais do YouTube e perfis públicos do TikTok diretamente no servidor. Ele também possui a rota `/media`: se o Cobalt responder `error.api.youtube.login`, o app usa automaticamente o yt-dlp próprio do backend para receber e unir vídeo+áudio. Na Aba 4 você pode escolher entre 12, 24, 48, 96, 200 ou **Perfil inteiro (até 500)** antes de buscar.

Se você já tinha publicado uma versão anterior, envie novamente os arquivos atualizados da pasta `backend` e o `render.yaml` ao GitHub. Depois, no Render, aguarde o novo deploy ou use **Manual Deploy > Deploy latest commit**.

> Se apareceu `Deploy failed` logo após adicionar a listagem de perfis, substitua o `backend/Dockerfile` pela versão atual. A imagem do Cobalt usa Alpine Linux; a correção usa `apk` e o binário `yt-dlp_musllinux` compatível.

Perfis do Instagram podem exigir login ou aplicar bloqueio temporário; nesses casos, use links individuais de Reels/publicações.

## Envio automático para as Abas 1 e 2

Na Aba 4 existe a opção **Enviar automaticamente para edição**. Escolha a Aba 1 ou 2. Quando ligada:

1. o vídeo é baixado;
2. o arquivo entra na fila da aba escolhida;
3. o preset interno força edição criativa, espelhamento, micro-oscilação, ruído esteganográfico e blindagem acústica diretamente na configuração de exportação; **Desfocar Região permanece desligado** no envio automático;
4. no Render Rápido, a Edição Criativa aplica zoom, re-enquadramento com troca seca de foco, flash periódico e nitidez; áudio e vídeo têm timestamps zerados, vídeo normalizado em 30 fps e áudio corrigido por ressincronização assíncrona; se algum filtro não for suportado, o app cai automaticamente para o motor Canvas mantendo as camadas;
5. o processamento começa automaticamente.

O desfoque de região não é ativado automaticamente porque a máscara manual poderia cair sobre uma parte aleatória da cena. Ative-o apenas quando puder posicionar o quadrado amarelo sobre um logotipo ou QR code. Uma detecção automática exata de logotipos, legendas e QR codes exigiria rastreamento visual dedicado e não é simulada por uma posição fixa.

Por padrão, o original é recebido somente como arquivo temporário na memória e **não** é salvo na pasta Downloads; apenas o vídeo final processado é baixado. Se quiser guardar as duas versões, marque **Salvar também o vídeo original**.

Para vários vídeos, marque os itens e use **Enviar selecionados para edição**. Todos os arquivos disponíveis entram juntos na mesma fila; novos arquivos são acrescentados ao fim, sem substituir os anteriores.

## Observações

- No plano gratuito, o serviço pode adormecer. O primeiro teste depois de um período sem uso pode levar até cerca de um minuto.
- Use links públicos. Conteúdo privado, removido, com login obrigatório ou bloqueado por região não poderá ser processado.
- Serviços como YouTube e Instagram podem limitar endereços de datacenter. Se o YouTube mostrar `error.api.youtube.login` ou `Sign in to confirm you’re not a bot`, siga o arquivo **YOUTUBE-COOKIES.md** e adicione `youtube-cookies.txt` em **Render > Environment > Secret Files**.
- Nunca envie cookies para o GitHub; use apenas Secret Files e, de preferência, uma conta secundária.
- O backend usa o projeto de código aberto Cobalt e não armazena os vídeos permanentemente.
- Use somente conteúdo próprio ou que você tenha autorização para salvar e reutilizar.
