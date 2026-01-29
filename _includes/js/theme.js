function EnumerateThemes() {
  return document.querySelectorAll('.theme-switcher input[name="theme"]')
}

function RestoreSelectedTheme() {
  let theme = localStorage.getItem("theme")
  if(!theme) {
    return
  }
  EnumerateThemes().forEach((themeOption) => {
    if(themeOption.getAttribute('value') === theme) {
      themeOption.checked = true;
    }
  })
}

function StoreTheme(theme) {
  localStorage.setItem("theme", theme)
}

document.addEventListener('DOMContentLoaded', (event) => {
  RestoreSelectedTheme();
  
  EnumerateThemes().forEach(themeOption => {
    themeOption.addEventListener('click', () => {
      let theme = themeOption.getAttribute('value');
      StoreTheme(theme);
    })
  })
})
