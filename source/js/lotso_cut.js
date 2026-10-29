// Mocen_Bear 注入 JS：剪刀分割线 → 点击剪断 → 评论区展开/收起
// 规则：不响应 hover（只认 click）；点一下剪刀滑到右端+虚线消失+评论区落下展开
//      再点一下剪刀滑回左端+虚线复原+评论区收起
;(function () {
  function place(hint, hr) {
    var hrR = hr.getBoundingClientRect()
    var anchor = hr.offsetParent || document.body
    var pR = anchor.getBoundingClientRect()
    hint.style.top = (hrR.top - pR.top - 40) + 'px'
    hint.style.left = (hrR.left - pR.left + hrR.width * 0.05) + 'px'
  }

  function init() {
    var pc = document.getElementById('post-comment')
    if (!pc) return
    // 只认评论区头顶那把剪刀（紧邻 #post-comment 的 hr），避免误绑正文里的分割线
    var prev = pc.previousElementSibling
    var hr = prev && prev.tagName === 'HR' && prev.classList.contains('custom-hr') ? prev : document.querySelector('hr.custom-hr')
    if (!hr) return
    if (hr.dataset.lotsoCut === '1') return
    hr.dataset.lotsoCut = '1'
    hr.setAttribute('title', '点我剪开评论区 ✂')

    // 提示语：告诉访客剪刀是干嘛的；剪开后消失，收起时回来
    var hint = document.createElement('div')
    hint.className = 'cut-hint'
    hint.textContent = '点击展开评论'
    var anchor = hr.offsetParent || document.body
    anchor.appendChild(hint)
    place(hint, hr)
    window.addEventListener('resize', function () {
      place(hint, hr)
    })
    hint.addEventListener('click', function () {
      hr.click()
    })

    hr.addEventListener('click', function () {
      var open = hr.classList.toggle('cut-open')
      hint.classList.toggle('cut-hint-hide', open)
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