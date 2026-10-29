// Mocen_Bear 注入 JS：剪刀分割线 → 点击剪断 → 评论区展开/收起
// 规则：不响应 hover（只认 click）；点一下剪刀滑到右端+虚线消失+评论区落下展开
//      再点一下剪刀滑回左端+虚线复原+评论区收起
;(function () {
  function init() {
    var hr = document.querySelector('hr.custom-hr')
    if (!hr) return
    var pc = document.getElementById('post-comment')
    if (!pc) return
    if (hr.dataset.lotsoCut === '1') return
    hr.dataset.lotsoCut = '1'
    hr.setAttribute('title', '点我剪开评论区')
    hr.addEventListener('click', function () {
      var open = hr.classList.toggle('cut-open')
      hr.classList.add('cut-clicked')
      if (open) {
        pc.classList.add('cut-open')
        pc.style.maxHeight = pc.scrollHeight + 40 + 'px'
      } else {
        pc.classList.remove('cut-open')
        pc.style.maxHeight = '0px'
      }
    })
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
  // pjax 翻页兼容（主题若启用 pjax 会重入）
  document.addEventListener('pjax:complete', function () {
    setTimeout(init, 100)
  })
})()