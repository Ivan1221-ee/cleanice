const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('site-menu');
const mobileMenu = matchMedia('(max-width: 880px)');

function setMenu(open, restoreFocus = false) {
  menu.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Закрыть' : 'Меню';
  if (restoreFocus) toggle.focus();
}

toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
menu.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
});
document.addEventListener('pointerdown', event => {
  if (!header.contains(event.target) && menu.classList.contains('is-open')) setMenu(false);
});
mobileMenu.addEventListener('change', () => setMenu(false));

function updateHeader() {
  header.classList.toggle('is-scrolled', scrollY > 4);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const dialog = document.querySelector('.quote-dialog');
if (dialog) {
  const mainForm = document.querySelector('.request-form');
  const dialogForm = mainForm.cloneNode(true);
  dialog.append(dialogForm);
  const closeButton = dialog.querySelector('.dialog-close');
  const dialogTitle = document.getElementById('quote-title');
  let opener;

  for (const link of document.querySelectorAll('[data-quote]')) {
    link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      dialogForm.reset();
      dialogForm.elements.phone.setCustomValidity('');
      dialogForm.querySelector('[role=status]').replaceChildren();
      const service = link.dataset.service;
      dialogTitle.textContent = service || 'Заказать уборку';
      dialogForm.elements.comment.value = service ? 'Услуга: ' + service : '';
      dialog.showModal();
    });
  }
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rectangle = dialog.getBoundingClientRect();
    if (event.clientX < rectangle.left || event.clientX > rectangle.right ||
        event.clientY < rectangle.top || event.clientY > rectangle.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (opener?.getClientRects().length) opener.focus();
    else if (mobileMenu.matches) toggle.focus();
  });

  for (const form of [mainForm, dialogForm]) {
    const phone = form.elements.phone;
    phone.addEventListener('input', () => {
      const digits = phone.value.replace(/\D/g, '').replace(/^[78]/, '').slice(0, 10);
      phone.value = digits ? '+7 (' + digits.slice(0, 3)
        + (digits.length > 3 ? ') ' + digits.slice(3, 6) : '')
        + (digits.length > 6 ? '-' + digits.slice(6, 8) : '')
        + (digits.length > 8 ? '-' + digits.slice(8) : '') : '';
      phone.setCustomValidity('');
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (phone.value.replace(/\D/g, '').length !== 11) {
        phone.setCustomValidity('Введите номер телефона полностью.');
        phone.reportValidity();
        return;
      }
      const { name, comment } = form.elements;
      const body = ['Имя: ' + name.value.trim(), 'Телефон: ' + phone.value, comment.value.trim()]
        .filter(Boolean).join('\n');
      const email = document.createElement('a');
      email.textContent = 'Открыть письмо';
      email.href = 'mailto:CleanIce@gmail.com?subject=' + encodeURIComponent('Запрос на уборку CleanIce')
        + '&body=' + encodeURIComponent(body);
      form.querySelector('[role=status]').replaceChildren('Запрос подготовлен. ', email, ' и отправьте его из почтового приложения.');
    });
  }
}

const reviewList = document.getElementById('review-list');
if (reviewList) {
  const previous = document.querySelector('[data-slide="-1"]');
  const next = document.querySelector('[data-slide="1"]');

  function updateCarousel() {
    previous.disabled = reviewList.scrollLeft <= 1;
    next.disabled = reviewList.scrollLeft + reviewList.clientWidth >= reviewList.scrollWidth - 1;
  }
  for (const button of [previous, next]) {
    button.addEventListener('click', () => {
      const [first, second] = reviewList.children;
      const step = second.offsetLeft - first.offsetLeft;
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      reviewList.scrollBy({ left: Number(button.dataset.slide) * step, behavior: reducedMotion ? 'instant' : 'smooth' });
    });
  }
  reviewList.addEventListener('scroll', updateCarousel, { passive: true });
  new ResizeObserver(updateCarousel).observe(reviewList);
  updateCarousel();
}
