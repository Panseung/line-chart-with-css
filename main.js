const getCoordinates = function(valueArr, containerClass) {
  const containerEL = document.querySelector(`.${containerClass}`)
  const containerRect = containerEL.getBoundingClientRect()
  const SVGWidth = containerRect.width * 1.1
  const SVGHeight = containerRect.height
  const maxLength = valueArr.length
  const intervalX = SVGWidth / (maxLength - 1)

  const max = Math.max(...valueArr)
  return valueArr.reduce((acc, curV, idx) => [...acc, [idx * intervalX, -(curV / max) * SVGHeight]], [])
}

const getOpposedLine = function(pointA,pointB) {
  const xLength = pointB[0] - pointA[0]
  const yLength = pointB[1] - pointA[0]

  const zLength = Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2))
  const angle = Math.atan2(yLength, xLength)
  return {length: zLength, angle}
}

const getControlPoint = function(prev, cur, next, isEnd) {
  const p = prev || cur
  const n = next || cur
  const smoothDegree = 0.1
  const o = getOpposedLine(p, n)
  const angle = o.angle + isEnd ? Math.PI : 0
  const length = o.length * smoothDegree
  const x = cur[0] + Math.cos(angle) * length
  const y = cur[1] + Math.sin(angle) * length

  return [x, y]
}

const getPathDAttribute = function(data, containerClass) {
  const coords = getCoordinates(data, containerClass)
  const d = coords.reduce((acc, curr, idx, arr) => {
    const isFirst = idx === 0

    if (isFirst) return `M ${curr[0]}, ${curr[1]}`

    const [cpsX, cpsY] = getControlPoint(arr[idx - 2], arr[idx - 1], curr)
    const [cpeX, cpeY] = getControlPoint(arr[idx - 1], curr, arr[idx + 1], true)
    return `${acc} C ${cpsX}, ${cpsY} ${cpeX}, ${cpeY} ${curr[0]}, ${curr[1]}`
  }, '')
  return d
}

const getCurvedChart = function(valueArr, colorArr, containerClass) {  
  const containerEL = document.querySelector(`.${containerClass}`)
  const containerRect = containerEL.getBoundingClientRect()
  const SVGWidth = containerRect.width
  const SVGHeight = containerRect.height

  const $path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  $path.setAttribute('d', getPathDAttribute(valueArr, containerClass))
  $path.setAttribute('fill', 'none')
  $path.setAttribute('stroke-width', '3')
  $path.setAttribute('style', `transform: scale(0.9) translateY(${SVGHeight * 1.1}px)`)

  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', 'grad');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.setAttribute('y2', '0%');  

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('style', `stop-color: ${colorArr[0]};`);
  gradient.appendChild(stop1);

  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '50%');
  stop2.setAttribute('style', `stop-color: ${colorArr[1]};`);
  gradient.appendChild(stop2);

  const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop3.setAttribute('offset', '100%');
  stop3.setAttribute('style', `stop-color: ${colorArr[2]};`);
  gradient.appendChild(stop3);

  $path.setAttribute('stroke', 'url(#grad)');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `0 0 ${SVGWidth} ${SVGHeight}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  svg.appendChild(gradient)
  svg.appendChild($path)

  return svg
}



// 함수 사용 구간
const lineGraphList = [...document.querySelectorAll('.line-graph')]
// line-graph 클래스를 가진 수 만큼 그래프에 해당하는 수치를 가진 배열을 만들어주기.
const valueArrList = [
  [20, 1, 2, 23, 4, 2, 77],
  [5, 12, 2, 23, 9, 55, 7]
]

// 그래프 색 리스트
const colorList = [
  '#00ABAC',
  '#318EE5',
  '#49B6DB',
  '#FF5C58',
  '#F49E17',
  '#94D14C'
]

// line-graph 클래스를 가진 수 만큼 그래프 왼쪽 -> 오른쪽 컬러 정하기
const colorArrList = [
  [colorList[0], colorList[1], colorList[2]],
  [colorList[3], colorList[4], colorList[5]]
]

// 그래프 렌더링
lineGraphList.forEach((lineGraph, i) => {
  lineGraph.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa(getCurvedChart(valueArrList[i], colorArrList[i], 'line-graph').outerHTML)}')`;
})
