function noOperation() {
  // NOOP function
}

function handleMouseUp(
  moveHandler,
  parent,
  previousElement,
  divider,
  nextElement
) {
  return function handler(event) {
    event.preventDefault();

    document.removeEventListener("mousemove", moveHandler);
    document.removeEventListener("mouseup", handler);

    previousElement.removeEventListener("selectstart", noOperation);
    previousElement.removeEventListener("dragstart", noOperation);
    nextElement.removeEventListener("selectstart", noOperation);
    nextElement.removeEventListener("dragstart", noOperation);

    previousElement.style.userSelect = "";
    previousElement.style.webkitUserSelect = "";
    previousElement.style.MozUserSelect = "";
    previousElement.style.pointerEvents = "";

    nextElement.style.userSelect = "";
    nextElement.style.webkitUserSelect = "";
    nextElement.style.MozUserSelect = "";
    nextElement.style.pointerEvents = "";

    divider.style.cursor = "";
    parent.style.cursor = "";
    document.body.style.cursor = "";
  };
}

function handleMouseMove(
  position,
  mouseDownEvent,
  dragOffset,
  system,
  updateSizes
) {
  return function handler(mouseMoveEvent) {
    mouseMoveEvent.preventDefault();

    const offset =
      mouseMoveEvent.clientX -
      mouseDownEvent.target.previousElementSibling.getBoundingClientRect()
        .left +
      (system.panelSpaceForDivider - dragOffset);

    const size =
      system.panelSpaceForDivider * 2 +
      mouseDownEvent.target.previousElementSibling.getBoundingClientRect()
        .width +
      mouseDownEvent.target.nextElementSibling.getBoundingClientRect().width;

    const totalPer = system.sizes[position - 1] + system.sizes[position];
    const previousSiblingSize = (offset / size) * totalPer;
    const nextSiblingSize = totalPer - (offset / size) * totalPer;

    updateSizes(position, [previousSiblingSize, nextSiblingSize]);
  };
}

export function handleMouseDown(position, event, system, updateSizes) {
  event.preventDefault();
  if (event.button !== 0) {
    return;
  }

  const previousElement = event.target.previousElementSibling;
  const nextElement = event.target.nextElementSibling;

  previousElement.addEventListener("selectstart", noOperation);
  previousElement.addEventListener("dragstart", noOperation);
  nextElement.addEventListener("selectstart", noOperation);
  nextElement.addEventListener("dragstart", noOperation);

  previousElement.style.userSelect = "none";
  previousElement.style.webkitUserSelect = "none";
  previousElement.style.MozUserSelect = "none";
  previousElement.style.pointerEvents = "none";

  nextElement.style.userSelect = "none";
  nextElement.style.webkitUserSelect = "none";
  nextElement.style.MozUserSelect = "none";
  nextElement.style.pointerEvents = "none";

  event.target.style.cursor = system.cursor;
  event.target.parentElement.style.cursor = system.cursor;
  document.body.style.cursor = system.cursor;

  const dragOffset = event.clientX - event.target.getBoundingClientRect().left;
  const moveHandler = handleMouseMove(
    position,
    event,
    dragOffset,
    system,
    updateSizes
  );

  document.addEventListener("mousemove", moveHandler);
  document.addEventListener(
    "mouseup",
    handleMouseUp(
      moveHandler,
      event.target.parentElement,
      previousElement,
      event.target,
      nextElement
    )
  );
}

function createArray(length, value) {
  const emptyCollection = [];
  while (length) {
    emptyCollection.push(value);
    length--;
  }
  return emptyCollection;
}

export function buildSystem(amountOfDivisions, options) {
  const system = {
    sizes: createArray(amountOfDivisions, 100 / amountOfDivisions),
    minSizes: createArray(amountOfDivisions, 100),
    maxSizes: createArray(amountOfDivisions, Number.POSITIVE_INFINITY),
    divide: "vertical",
    cursor: options.divide == "horizontal" ? "row-resize" : "col-resize",
    onDrag: noOperation,
    onDragStart: noOperation,
    onDragEnd: noOperation,
    onResize: noOperation,
    dividerSize: 10,
    numberOfPanels: amountOfDivisions,
    numberOfDividers: amountOfDivisions - 1,
    panelSpaceForDivider: 0,
    eventDimension: 0,
    elementDimension: 0,
  };

  for (const key of Object.keys(options)) {
    if (options[key].constructor.name === system[key].constructor.name) {
      system[key] = options[key];
    } else {
      throw new Error(
        `config, ${options[key]}, should be of type: ${system[key].constructor.name}`
      );
    }
  }

  system.panelSpaceForDivider =
    (system.dividerSize * system.numberOfDividers) / system.numberOfPanels;

  return system;
}
