// Adds the shared top bar and footer. Each page says where the site root is, e.g. <script src="../assets/site.js" data-root="../">.
(function () {
  var me = document.currentScript, root = (me && me.getAttribute('data-root')) || '', here = (me && me.getAttribute('data-here')) || '';
  var S = window.SITE || {};
  var link = function (href, text, id) { return '<a href="' + href + '"' + (id === here ? ' aria-current="page"' : '') + '>' + text + '</a>'; };
  var top = document.getElementById('site-top');
  if (top) top.innerHTML = '<div class="top"><div class="in"><span class="name">' + (S.club || 'Bridge school') + '</span><nav aria-label="Main">' +
    link(root + 'info/', 'General information', 'info') + ' &nbsp; ' + link(root, 'Play the Hand', 'play') + '</nav></div></div>';
  var foot = document.getElementById('site-footer');
  if (foot) foot.innerHTML = '<footer><p>&copy; ' + (S.club || '') + '. ' + (S.club || '') + ' is an unincorporated association.</p>' +
    '<p>Lessons, cheat sheets and boards are for teaching and personal study. They are provided as they are and may contain errors.</p>' +
    '<p>This site is not affiliated with the English Bridge Union or the World Bridge Federation.</p>' +
    '<p class="nav">' + link(root + 'privacy/', 'Privacy, cookies and accessibility', 'privacy') + '</p></footer>';
})();
