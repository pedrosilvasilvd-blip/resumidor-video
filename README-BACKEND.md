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

## Observações

- No plano gratuito, o serviço pode adormecer. O primeiro teste depois de um período sem uso pode levar até cerca de um minuto.
- Use links públicos. Conteúdo privado, removido, com login obrigatório ou bloqueado por região não poderá ser processado.
- Serviços como YouTube e Instagram podem limitar endereços de datacenter. Se isso ocorrer, tente novamente mais tarde.
- O backend usa o projeto de código aberto Cobalt e não armazena os vídeos permanentemente.
- Use somente conteúdo próprio ou que você tenha autorização para salvar e reutilizar.
