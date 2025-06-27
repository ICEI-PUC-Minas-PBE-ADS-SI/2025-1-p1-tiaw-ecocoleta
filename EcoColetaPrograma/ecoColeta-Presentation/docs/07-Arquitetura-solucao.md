# Arquitetura da solução

<span style="color:red">Pré-requisitos: <a href="05-Projeto-interface.md"> Projeto de interface</a></span>

Definição de como o software é estruturado em termos dos componentes que fazem parte da solução e do ambiente de hospedagem da aplicação.

![Arquitetura da solução](images/exemplo-arquitetura.png)

## Funcionalidades

Esta seção apresenta as funcionalidades da solução.

##### Funcionalidade 1 - Cadastro de Usuários

Permite a inclusão, leitura, alteração e exclusão de usuários para o sistema

* **Estrutura de dados:** Usuário
* **Instruções de acesso:**
  * Abra o site e efetue o cadastro;
  * Acesse o menu principal e escolha a opção "Com a imagem do avatar";
* **Tela da funcionalidade**:

![alt text](<../tela de cadastro.png>)



### Estruturas de dados

Guarda as informações do cadastro e login do usuário.

##### Estrutura de dados - Dados do usuário


Estrutura de dados do usuário:

 {
      "id": 7,
      "nome": "teste",
      "email": "teste@gmail.com",
      "senha": "123456",
      "celular": "11999999999",
      "bio": "",
      "avatar": "http://localhost:3000/assets/img/user.png"
    }


### Módulos e APIs

Esta seção apresenta os módulos e APIs utilizados na solução.


**Fonts:**

* Fonte awesome - https://fontawesome.com/

**Scripts:**

* jQuery - https://jquery.com/
* Bootstrap - https://getbootstrap.com/
* GSAP - https://gsap.com/
* ScrollReveal - revealjs.org 


## Hospedagem

Explique como a hospedagem e o lançamento da plataforma foram realizados.

> **Links úteis**:
> - [Website com GitHub Pages](https://pages.github.com/)
> - [Programação colaborativa com Repl.it](https://repl.it/)
> - [Getting started with Heroku](https://devcenter.heroku.com/start)
> - [Publicando seu site no Heroku](http://pythonclub.com.br/publicando-seu-hello-world-no-heroku.html)
