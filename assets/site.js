// Adds the shared top bar and footer. Each page says where the site root is, e.g. <script src="../assets/site.js" data-root="../" data-here="info">.
(function () {
  var me = document.currentScript, root = (me && me.getAttribute('data-root')) || '', here = (me && me.getAttribute('data-here')) || '';
  var S = window.SITE || {};
  var link = function (href, text, id) { return '<a href="' + href + '"' + (id === here ? ' aria-current="page"' : '') + '>' + text + '</a>'; };
  var top = document.getElementById('site-top');
  if (top) top.innerHTML = '<div class="top"><div class="in"><a class="name" href="' + root + '">' + (S.school || S.club || 'Bridge school') + '</a><nav aria-label="Main">' +
    link(root + 'lessons/', 'Lessons', 'lessons') + link(root + 'interactive/', 'Interactive features', 'interactive') + link(root + 'infographics/', 'Infographics', 'infographics') +
    link(root + 'info/', 'General information', 'info') + '</nav></div></div>';
  var foot = document.getElementById('site-footer');
  if (foot) {
    var where = [S.club, S.place].filter(Boolean).join(', ');
    var addr = S.map ? '<a href="' + S.map + '" rel="noopener">' + (S.address || 'Map') + '</a>' : (S.address || '');
    foot.innerHTML = '<footer><p class="addr">' + where + (addr ? ', ' + addr : '') + '</p>' +
      '<p>&copy; ' + (S.club || '') + '. ' + (S.club || '') + ' is an unincorporated association.</p>' +
      '<p>Lessons, cheat sheets and boards are for teaching and personal study. They are provided as they are and may contain errors.</p>' +
      '<p>This site is not affiliated with the English Bridge Union or the World Bridge Federation.</p>' +
      '<p class="nav">' + link(root + 'privacy/', 'Privacy, cookies and accessibility', 'privacy') + '</p></footer>';
  }
})();
