import { onAuthStateChanged } from "firebase/auth";
import { auth } from '/src/firebaseConfig.js';
import { logoutUser } from '/src/authentication.js';

class SiteNavbar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.renderNavbar();
    this.renderAuthControls();
  }

  renderNavbar() {
  this.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center" href="/index.html">
          <img src="/images/logo.png" alt="LostNFound Logo" width="40" height="40" class="me-2" />
          LostNFound
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent"
          aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" href="/main.html">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/saved.html">Saved</a>
            </li>
          </ul>

          <form class="d-flex me-3" role="search" id="searchForm">
            <input class="form-control me-2" type="search" placeholder="Search lost items" aria-label="Search" id="searchInput" />
            <button class="btn btn-outline-light" type="submit">Search</button>
          </form>

          <div id="authControls" class="d-flex"></div>
        </div>
      </div>
    </nav>
  `;
}


  renderAuthControls() {
    const authControls = this.querySelector('#authControls');

    // Placeholder to maintain layout space before auth state is known
    authControls.innerHTML = `<div class="btn btn-outline-light" style="visibility: hidden; min-width: 80px;">Log out</div>`;

    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in: show Profile link and Logout button
        authControls.innerHTML = `
          <a class="btn btn-outline-light me-2" href="/profile.html" style="min-width: 80px;">Profile</a>
          <button class="btn btn-outline-light" id="signOutBtn" type="button" style="min-width: 80px;">Log out</button>
        `;
        const signOutBtn = authControls.querySelector('#signOutBtn');
        signOutBtn?.addEventListener('click', logoutUser);
      } else {
        // User is logged out: show Login link
        authControls.innerHTML = `
          <a class="btn btn-outline-light" id="loginBtn" href="/login.html" style="min-width: 80px;">Log in</a>
        `;
      }
    });
  }
}

customElements.define('site-navbar', SiteNavbar);
