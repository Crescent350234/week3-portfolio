// 作品集页面轻量交互：提醒未设置链接的卡片
(function () {
  document.querySelectorAll('.work').forEach((card) => {
    card.addEventListener('click', (event) => {
      const href = card.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#')) {
        event.preventDefault();
        const title = card.querySelector('.work__title').textContent;
        alert(`「${title}」的链接尚未设置，请在 index.html 中修改 href。`);
      }
    });
  });
})();
