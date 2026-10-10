// 作品集页面轻量交互：提醒未设置链接的卡片
(function () {
  document.querySelectorAll('.work-card__btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const href = btn.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#')) {
        event.preventDefault();
        const title = btn.closest('.work-card').querySelector('.work-card__title').textContent;
        alert(`「${title}」的链接尚未设置，请在 index.html 中修改 href。`);
      }
    });
  });
})();
