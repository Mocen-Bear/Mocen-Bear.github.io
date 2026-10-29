// Mocen_Bear 注入 JS：剪刀分割线 → 点击剪断 → 评论区展开/收起
// 规则：不响应 hover（只认 click）；点一下剪刀滑到右端+虚线消失+评论区落下展开
//      再点一下剪刀滑回左端+虚线复原+评论区收起
;(function () {
  function init() {
    var pc = document.getElementById('post-comment')
    if (!pc) return
    // 找评论区头顶那把剪刀：先看紧邻的 hr，被包裹过（pjax 重入）就退回全局查
    var prev = pc.previousElementSibling
    var hr = prev && prev.tagName === 'HR' && prev.classList.contains('custom-hr') ? prev : document.querySelector('hr.custom-hr')
    if (!hr) return
    if (hr.dataset.lotsoCut === '1') return
    hr.dataset.lotsoCut = '1'
    hr.setAttribute('title', '点我剪开评论区 ✂')

    // 把 hr 包进一个自带定位的薄壳，提示语作为它的绝对定位子元素：
    // 壳就是坐标系，宽度随文章列自适应 → 提示语永远钉在剪刀上方，不需要任何 JS 算坐标
    var wrap = document.createElement('div')
    wrap.className = 'cut-wrap'
    hr.parentNode.insertBefore(wrap, hr)
    wrap.appendChild(hr)

    var hint = document.createElement('div')
    hint.className = 'cut-hint'
    hint.textContent = '点击展开评论'
    wrap.appendChild(hint)
    hint.addEventListener('click', function () {
      hr.click()
    })

    var guide = document.createElement('div')
    guide.className = 'cut-guide'
    guide.innerHTML =
      '<span class="cut-guide-icon"></span>' +
      '<span>这里是我的留言板：<b>点「使用 GitHub 登录」用 GitHub 账号登录</b>，就能留下你的话，每条留言都永久保存不怕丢 🐻</span>'
    pc.querySelector('.comment-wrap').parentNode.insertBefore(guide, pc.querySelector('.comment-wrap'))

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