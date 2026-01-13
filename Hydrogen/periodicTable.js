/**
 * Builds periodic table UI layout using chemical rules
 * No hardcoded positions
 */

export function buildPeriodicTableUI({
  data,
  containerId,
  onSelect
}) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  Object.values(data).forEach(element => {
    const cell = document.createElement("div");

    cell.classList.add("element", element.block);
    if (element.group === 18) {
      cell.classList.add("noble");
    }
    const symbol = document.createElement("div");
    symbol.className = "symbol";
    symbol.textContent = element.symbol;

    const atomicNumber = document.createElement("div");
    atomicNumber.className = "atomic-number";
    atomicNumber.textContent = element.atomicNumber;

    cell.appendChild(symbol);
    cell.appendChild(atomicNumber);

    // 🔑 CHEMISTRY → UI
    cell.style.gridRow = element.period;
    cell.style.gridColumn = element.group;
    cell.dataset.name = element.name;

    cell.onclick = () => {
      document
        .querySelectorAll(".element")
        .forEach(e => e.classList.remove("active"));

      cell.classList.add("active");

      onSelect(element);
    };

    container.appendChild(cell);
  });
}

function getValenceInfo(element) {
  const group = element.group;

  // Noble gases
  if (group === 18) {
    return { valenceElectrons: 8, valency: 0 };
  }

  // s-block
  if (group === 1) return { valenceElectrons: 1, valency: 1 };
  if (group === 2) return { valenceElectrons: 2, valency: 2 };

  // p-block
  if (group >= 13 && group <= 17) {
    const ve = group - 10;
    const valency = ve <= 4 ? ve : 8 - ve;
    return { valenceElectrons: ve, valency };
  }

  // d-block (variable)
  return { valenceElectrons: null, valency: "—" };
}