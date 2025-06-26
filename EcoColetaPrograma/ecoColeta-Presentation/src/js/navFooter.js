// Criando o link para o CSS
let linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "../css/navFooter.css";
document.head.appendChild(linkElement);

const body = document.querySelector("body");
const tagScript = document.querySelector('script[src*="navFooter.js"]');

// Função para verificar se o usuário está logado
function isUserLoggedIn() {
  return localStorage.getItem("usuarioLogado") !== null;
}

// Função para obter dados do usuário logado
function getLoggedInUser() {
  const userData = localStorage.getItem("usuarioLogado");
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error("Erro ao analisar dados do usuário:", e);
      return null;
    }
  }
  return null;
}

// Função para fazer logout
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

// Criando o Nav
let nav = document.createElement("nav");
nav.className = "nav";
nav.id = "nav";

let navContainer = document.createElement("div");
navContainer.className = "nav-container";

let navContent = document.createElement("div");
navContent.className = "nav-content";

// Criando logo
let logoContainer = document.createElement("div");
logoContainer.className = "logo-container";

let logoWrapper = document.createElement("div");
logoWrapper.className = "logo-wrapper";

let linksitem = document.createElement("a");
linksitem.className = "logo-item";
linksitem.href = "index.html";

let logoImage = document.createElement("div");
logoImage.className = "logo-image";

let navimg = document.createElement("img");
navimg.src =
  "https://cdn.builder.io/api/v1/image/assets/TEMP/313a86a3763eb086a92f424be391c74cac3baa49?placeholderIfAbsent=true&apiKey=9d5f0dcfa7364879a1f7ce16420e4a1e";
navimg.alt = "EcoColeta Logo";
navimg.className = "logo";

let logoText = document.createElement("div");
logoText.className = "logo-text";
logoText.textContent = "EcoColeta";

// Menu principal para desktop
let navMenu = document.createElement("div");
navMenu.className = "menu";

// Itens do menu
const menuItems = [
  { text: "Mapa", href: "encontraEco.html" },
  { text: "Guia", href: "guiaEdu.html" },
  { text: "Recompensas", href: "recompensas.html" },
  { text: "Comunidade", href: "comunidade.html" },
];

// Criando itens do menu principal
menuItems.forEach((item) => {
  let link = document.createElement("a");
  link.href = item.href;

  let menuItem = document.createElement("div");
  menuItem.className = "menu-item";
  menuItem.textContent = item.text;

  link.appendChild(menuItem);
  navMenu.appendChild(link);
});

// Criando botão de login para desktop
let loginContainer = document.createElement("div");
loginContainer.className = "login-container";

let loginButton = document.createElement("div");
loginButton.className = "login-button";
loginButton.textContent = "Entrar";
loginButton.addEventListener("click", function () {
  window.location.href = "autent.html";
});

loginContainer.appendChild(loginButton);

// Criando perfil do usuário para desktop
let userProfileDesktop = document.createElement("div");
userProfileDesktop.className = "user-profile-desktop";

let userAvatar = document.createElement("div");
userAvatar.className = "user-avatar";

// Dropdown do perfil
let profileDropdown = document.createElement("div");
profileDropdown.className = "profile-dropdown";

// Itens do dropdown
const dropdownItems = [
  {
    text: "Meu Perfil",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    href: "perfil.html",
  },
  {
    text: "Configurações",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    href: "#",
  },
  {
    text: "Tema Escuro",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path></svg>',
    onClick: function () {
      toggleDarkMode();
    },
  },
  { isDivider: true },
  {
    text: "Sair",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
    isLogout: true,
  },
];

dropdownItems.forEach((item) => {
  if (item.isDivider) {
    let divider = document.createElement("div");
    divider.className = "profile-dropdown-divider";
    profileDropdown.appendChild(divider);
  } else {
    let dropdownItem = document.createElement("div");
    dropdownItem.className = "profile-dropdown-item";
    let icon = document.createElement("div");
    icon.className = "profile-dropdown-icon";
    icon.innerHTML = item.icon;
    let text = document.createElement("div");
    text.textContent = item.text;
    dropdownItem.appendChild(icon);
    dropdownItem.appendChild(text);
    if (item.isLogout) {
      dropdownItem.addEventListener("click", logout);
    } else if (item.onClick) {
      dropdownItem.addEventListener("click", item.onClick);
    } else if (item.href) {
      dropdownItem.addEventListener("click", function () {
        window.location.href = item.href;
      });
    }
    profileDropdown.appendChild(dropdownItem);
  }
});

userProfileDesktop.appendChild(userAvatar);
userProfileDesktop.appendChild(profileDropdown);

// Criando o container direito
let rightContainer = document.createElement("div");
rightContainer.className = "right-container";

// Menu Toggle para mobile
let menuToggle = document.createElement("input");
menuToggle.type = "checkbox";
menuToggle.className = "menu-toggle";
menuToggle.id = "menuToggle";

// Ícone do menu mobile
let menuIcon = document.createElement("label");
menuIcon.className = "menu-icon";
menuIcon.setAttribute("for", "menuToggle");
menuIcon.setAttribute("aria-label", "Abrir menu");

// Criando as três linhas do ícone
for (let i = 0; i < 3; i++) {
  let span = document.createElement("span");
  menuIcon.appendChild(span);
}

// Overlay do menu mobile
let menuOverlay = document.createElement("div");
menuOverlay.className = "menu-overlay";

// Menu mobile
let mobileMenu = document.createElement("div");
mobileMenu.className = "mobile-menu";

// Perfil do usuário no menu mobile
let mobileUserProfile = document.createElement("div");
mobileUserProfile.className = "mobile-user-profile";

let mobileUserProfileInner = document.createElement("div");
mobileUserProfileInner.className = "mobile-user-profile-inner";

let mobileUserAvatar = document.createElement("div");
mobileUserAvatar.className = "mobile-user-avatar";

let mobileUserInfo = document.createElement("div");
mobileUserInfo.className = "mobile-user-info";

let mobileUserName = document.createElement("div");
mobileUserName.className = "mobile-user-name";

let mobileUserEmail = document.createElement("div");
mobileUserEmail.className = "mobile-user-email";

let mobileLogoutButton = document.createElement("button");
mobileLogoutButton.className = "mobile-logout-button";
mobileLogoutButton.innerHTML =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Sair';
mobileLogoutButton.addEventListener("click", logout);

mobileUserInfo.appendChild(mobileUserName);
mobileUserInfo.appendChild(mobileUserEmail);
mobileUserInfo.appendChild(mobileLogoutButton);

mobileUserProfileInner.appendChild(mobileUserAvatar);
mobileUserProfileInner.appendChild(mobileUserInfo);

mobileUserProfile.appendChild(mobileUserProfileInner);

// Itens de navegação mobile
let mobileNavItems = document.createElement("div");
mobileNavItems.className = "mobile-nav-items";

// Ícones para o menu mobile
const mobileIcons = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
];

// Adicionando itens ao menu mobile
menuItems.forEach((item, index) => {
  let mobileNavItem = document.createElement("a");
  mobileNavItem.className = "mobile-nav-item";
  mobileNavItem.href = item.href;

  let mobileNavItemIcon = document.createElement("div");
  mobileNavItemIcon.className = "mobile-nav-item-icon";
  mobileNavItemIcon.innerHTML = mobileIcons[index];

  let mobileNavItemText = document.createElement("div");
  mobileNavItemText.className = "mobile-nav-item-text";
  mobileNavItemText.textContent = item.text;

  mobileNavItem.appendChild(mobileNavItemIcon);
  mobileNavItem.appendChild(mobileNavItemText);

  mobileNavItems.appendChild(mobileNavItem);
});
let mobileLoginButton = document.createElement("div");
mobileLoginButton.className = "mobile-login-button";
mobileLoginButton.textContent = "Entrar";
mobileLoginButton.addEventListener("click", function () {
  window.location.href = "autent.html";
});
mobileLoginButton.style.display = "none";
mobileMenu.appendChild(mobileLoginButton);

mobileMenu.appendChild(mobileUserProfile);
mobileMenu.appendChild(mobileNavItems);

// Montagem do NavBar
logoImage.appendChild(navimg);
logoWrapper.appendChild(linksitem);
linksitem.appendChild(logoImage);
linksitem.appendChild(logoText);

logoContainer.appendChild(logoWrapper);

// Adiciona elementos ao right container na ordem correta
rightContainer.appendChild(menuToggle);
rightContainer.appendChild(menuIcon);
rightContainer.appendChild(menuOverlay);
rightContainer.appendChild(mobileMenu);
rightContainer.appendChild(loginContainer);
rightContainer.appendChild(userProfileDesktop);

// Estrutura do layout
navContent.appendChild(logoContainer);
navContent.appendChild(navMenu);
navContent.appendChild(rightContainer);

navContainer.appendChild(navContent);
nav.appendChild(navContainer);
body.insertBefore(nav, body.firstChild);

// Atualiza o estado do menu baseado no status de login do usuário
function updateUserInterface() {
  const user = getLoggedInUser();

  if (user) {
    // Usuário está logado

    // Configuração do desktop
    loginContainer.style.display = "none";
    userProfileDesktop.style.display = "flex";

    // Configurar avatar no desktop
    if (user.imagem) {
      let img = document.createElement("img");
      img.src = user.imagem;
      img.alt = user.nome;
      userAvatar.innerHTML = "";
      userAvatar.appendChild(img);
    } else {
      userAvatar.innerHTML = (user.nome || "U").charAt(0).toUpperCase();
    }

    // Configuração do mobile
    mobileUserProfile.style.display = "block";
    mobileUserName.textContent = user.nome || "Usuário";
    mobileUserEmail.textContent = user.email || "";

    // Configurar avatar no mobile
    if (user.imagem) {
      let img = document.createElement("img");
      img.src = user.imagem;
      img.alt = user.nome;
      mobileUserAvatar.innerHTML = "";
      mobileUserAvatar.appendChild(img);
    } else {
      mobileUserAvatar.innerHTML = (user.nome || "U").charAt(0).toUpperCase();
    }

    // Adicionar botão de dashboard para coletor
    if (user.tipoUsuario === "coletor") {
      // Remover botões antigos para evitar repetição
      const oldDashboardDesktop =
        userProfileDesktop.querySelector(".dashboard-button");
      if (oldDashboardDesktop) oldDashboardDesktop.remove();
      const oldDashboardMobile = mobileUserInfo.querySelector(
        ".mobile-dashboard-button"
      );
      if (oldDashboardMobile) oldDashboardMobile.remove();

      // Botão para desktop (estilo igual aos outros do header)
      let dashboardButtonDesktop = document.createElement("button");
      dashboardButtonDesktop.className = "dashboard-button";
      dashboardButtonDesktop.innerHTML = `<svg style="margin-right:6px;vertical-align:middle;" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="13" width="7" height="8" rx="2"/><rect x="14" y="3" width="7" height="18" rx="2"/></svg>Dashboard`;
      dashboardButtonDesktop.addEventListener("click", function () {
        window.location.href = "dashboardAdmin.html";
      });
      userProfileDesktop.appendChild(dashboardButtonDesktop);

      // Botão para mobile (estilo igual aos outros do menu mobile)
      let dashboardButtonMobile = document.createElement("button");
      dashboardButtonMobile.className = "mobile-dashboard-button";
      dashboardButtonMobile.innerHTML = `<svg style="margin-right:6px;vertical-align:middle;" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="13" width="7" height="8" rx="2"/><rect x="14" y="3" width="7" height="18" rx="2"/></svg>Dashboard`;
      dashboardButtonMobile.addEventListener("click", function () {
        window.location.href = "dashboardAdmin.html";
      });
      mobileUserInfo.appendChild(dashboardButtonMobile);
    }
  } else {
    // Usuário não está logado
    loginContainer.style.display = "block";
    userProfileDesktop.style.display = "none";
    mobileUserProfile.style.display = "none";
    mobileLoginButton.style.display = "flex";
  }
}

// Executar a atualização da interface quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", updateUserInterface);

// Atualizar quando o localStorage mudar (em outras tabs)
window.addEventListener("storage", function (e) {
  if (e.key === "usuarioLogado") {
    updateUserInterface();
  }
});

// Adicionando evento de scroll para efeitos no header
window.addEventListener("scroll", function () {
  const nav = document.querySelector(".nav");
  if (window.scrollY > 20) {
    nav.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
    nav.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
  } else {
    nav.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
    nav.style.backgroundColor = "white";
  }
});

// Adicionar eventos após a criação dos elementos
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const menuIcon = document.querySelector(".menu-icon");
  const mobileMenu = document.querySelector(".mobile-menu");
  const menuOverlay = document.querySelector(".menu-overlay");

  if (menuIcon && menuToggle && mobileMenu && menuOverlay) {
    // Evento de clique no ícone do menu
    menuIcon.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      menuToggle.checked = !menuToggle.checked;

      if (menuToggle.checked) {
        document.body.style.overflow = "hidden";
        mobileMenu.style.transform = "translateX(0)";
        menuOverlay.style.opacity = "1";
        menuOverlay.style.visibility = "visible";
      } else {
        document.body.style.overflow = "";
        mobileMenu.style.transform = "translateX(100%)";
        menuOverlay.style.opacity = "0";
        menuOverlay.style.visibility = "hidden";
      }
    });

    // Evento de clique no overlay
    menuOverlay.addEventListener("click", function () {
      menuToggle.checked = false;
      document.body.style.overflow = "";
      mobileMenu.style.transform = "translateX(100%)";
      menuOverlay.style.opacity = "0";
      menuOverlay.style.visibility = "hidden";
    });

    // Evento de clique fora do menu
    document.addEventListener("click", function (event) {
      if (
        menuToggle.checked &&
        !mobileMenu.contains(event.target) &&
        !menuIcon.contains(event.target)
      ) {
        menuToggle.checked = false;
        document.body.style.overflow = "";
        mobileMenu.style.transform = "translateX(100%)";
        menuOverlay.style.opacity = "0";
        menuOverlay.style.visibility = "hidden";
      }
    });
  } else {
    console.error("Alguns elementos do menu não foram encontrados!");
  }

  // Criando Footer

  let footer = document.createElement("footer");
  footer.id = "footer";

  let divfooter = document.createElement("div");
  divfooter.className = "footer";

  let footerContent = document.createElement("div");
  footerContent.className = "footer-content";

  let footerLogo = document.createElement("div");
  footerLogo.className = "footer-logo";

  // Wrapper que agrupa imagem e título
  let footerLogoWrapper = document.createElement("div");
  footerLogoWrapper.className = "footer-logo-wrapper";

  let footerLogoImg = document.createElement("img");
  footerLogoImg.src =
    "https://cdn.builder.io/api/v1/image/assets/TEMP/313a86a3763eb086a92f424be391c74cac3baa49?placeholderIfAbsent=true&apiKey=9d5f0dcfa7364879a1f7ce16420e4a1e";
  footerLogoImg.alt = "EcoColeta";

  let footerLogoH3 = document.createElement("h3");
  footerLogoH3.textContent = "EcoColeta";

  footerLogoWrapper.appendChild(footerLogoImg);
  footerLogoWrapper.appendChild(footerLogoH3);

  let footerLogoP = document.createElement("p");
  footerLogoP.textContent =
    "Transformando a reciclagem em uma experiência recompensadora.";

  // Adiciona wrapper e parágrafo no logo
  footerLogo.appendChild(footerLogoWrapper);
  footerLogo.appendChild(footerLogoP);

  // Criando grupos de links
  let footerLinks = document.createElement("div");
  footerLinks.className = "footer-links";

  function createLinkGroup(title, links) {
    let group = document.createElement("div");
    group.className = "link-group";

    let h4 = document.createElement("h4");
    h4.textContent = title;

    let ul = document.createElement("ul");
    links.forEach((link) => {
      let li = document.createElement("li");
      let a = document.createElement("a");
      a.href = link.href;
      a.textContent = link.text;
      li.appendChild(a);
      ul.appendChild(li);
    });

    group.appendChild(h4);
    group.appendChild(ul);
    return group;
  }

  let group1 = createLinkGroup("Links Rápidos", [
    { text: "Sobre Nós", href: "#" },
    { text: "Como Funciona", href: "GuiaEdu.html" },
    { text: "Pontos de Coleta", href: "encontraEco.html" },
    { text: "Recompensas", href: "recompensas.html" },
  ]);

  let group2 = createLinkGroup("Suporte", [
    { text: "FAQ", href: "#" },
    { text: "Contato", href: "#" },
    { text: "Política de Privacidade", href: "#" },
    { text: "Termos de Uso", href: "#" },
  ]);

  let group3 = document.createElement("div");
  group3.className = "link-group";

  let group3H4 = document.createElement("h4");
  group3H4.textContent = "Redes Sociais";

  let sociaisIcons = document.createElement("div");
  sociaisIcons.className = "social-icons";

  let redes = ["facebook", "twitter", "instagram", "linkedin"];
  let redesLinks = [
    "https://www.facebook.com/",
    "https://twitter.com/",
    "https://www.instagram.com/",
    "https://www.linkedin.com/",
  ];
  redes.forEach((rede, index) => {
    let a = document.createElement("a");
    a.href = redesLinks[index];
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    let imgsoial = document.createElement("img");
    imgsoial.src = `assets/img/${rede}.svg`;
    imgsoial.style.width = `40px`;
    a.appendChild(imgsoial);
    sociaisIcons.appendChild(a);
  });

  group3.appendChild(group3H4);
  group3.appendChild(sociaisIcons);

  // Agrupando os grupos
  footerLinks.appendChild(group1);
  footerLinks.appendChild(group2);
  footerLinks.appendChild(group3);

  footerContent.appendChild(footerLogo);
  footerContent.appendChild(footerLinks);

  // Copyright
  let copyright = document.createElement("div");
  copyright.className = "copyright";

  let pCopyright = document.createElement("p");
  pCopyright.innerHTML = "&copy; 2025 EcoColeta. Todos os direitos reservados.";

  copyright.appendChild(pCopyright);
  divfooter.appendChild(footerContent);
  divfooter.appendChild(copyright);
  footer.appendChild(divfooter);

  tagScript.parentNode.insertBefore(footer, tagScript);
});

// Inicializar interface
updateUserInterface();
