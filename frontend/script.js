const API = "http://localhost:3000";
const ciclo = document.getElementById("ciclo");
const modal = document.getElementById("modal");
const title = document.getElementById("modal-title");
const input = document.getElementById("modal-input");
const inputWrapper = document.getElementById("input-wrapper");
const form = document.getElementById("modal-form");
const cancelar = document.getElementById("cancelar");

let onConfirm = null;

function abrirModal({
  titulo,
  usarInput = false,
  placeholder = "",
  valor = "",
  confirmar
}) {
  title.textContent = titulo;
  onConfirm = confirmar;

  if (usarInput) {
    inputWrapper.classList.remove("hidden");
    input.placeholder = placeholder;
    input.value = valor;
    input.focus();
  } else {
    inputWrapper.classList.add("hidden");
  }

  modal.classList.remove("hidden");
}

function fecharModal() {
  modal.classList.add("hidden");
  form.reset();
  onConfirm = null;
}

cancelar.onclick = fecharModal;

form.onsubmit = (e) => {
  e.preventDefault();

  if (!inputWrapper.classList.contains("hidden")) {
    const valor = input.value.trim();

    if (!valor) {
      input.classList.add("input-error");
      input.focus();
      return;
    }
    input.classList.remove("input-error");

    if (onConfirm) onConfirm(valor);
  } else {
    if (onConfirm) onConfirm();
  }

  fecharModal();
};

let db;
const MAX_HORAS = 10;

async function carregar() {
  const res = await fetch(`${API}/materias`);
  db = await res.json();
  render();
}

function salvar() {
  fetch(`${API}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(db)
  });
}

function render() {
  ciclo.innerHTML = "";

  db.materias.forEach((m, i) => {
    const div = document.createElement("div");
    div.className = "materia";

    div.innerHTML = `
      <div class="header">
        <h2>${m.nome} (${m.marcadas}/${m.horas}h)</h2>
        <div class="controls">
          <button type="button" onclick="addHora(${i})" ${m.horas >= MAX_HORAS ? "disabled" : ""}><i class="fi fi-br-plus-small"></i></button>
          <button type="button" onclick="remHora(${i})" ${m.horas <= 0 ? "disabled" : ""}><i class="fi fi-br-minus-small"></i></button>
          <button type="button" onclick="rem(${i})"}><i class="fi fi-br-trash"></i></button>
        </div>
      </div>

      <div class="horas">
        ${Array.from({ length: m.horas })
        .map(
          (_, h) =>
            `<div 
                class="hora ${h < m.marcadas ? "marcada" : ""}" 
                data-materia="${i}" 
                data-hora="${h}">
                ${h < m.marcadas ? "<i class=\"fi fi-br-check\"></i>" : ""}
              </div>`
        )
        .join("")}
      </div>
    `;

    ciclo.appendChild(div);
  });

  document.querySelectorAll(".hora").forEach(hora => {
    hora.addEventListener("click", () => {
      const materiaIndex = Number(hora.dataset.materia);
      const horaIndex = Number(hora.dataset.hora);
      toggleHora(materiaIndex, horaIndex);
    });
  });
}

function toggleHora(materiaIndex, horaIndex) {
  const materia = db.materias[materiaIndex];

  materia.marcadas = horaIndex + 1 === materia.marcadas ? horaIndex : horaIndex + 1;

  salvar();
  render();
}

function addHora(i) {
  if (db.materias[i].horas >= MAX_HORAS) return;

  db.materias[i].horas++;
  salvar();
  render();
}

function remHora(i) {
  if (db.materias[i].horas > 0) {
    db.materias[i].horas--;
    db.materias[i].marcadas = Math.min(
      db.materias[i].marcadas,
      db.materias[i].horas
    );
    salvar();
    render();
  }
}

function add() {
  abrirModal({
    titulo: "Adicionar matéria",
    usarInput: true,
    placeholder: "Nome da matéria",
    confirmar: (nome) => {
      if (!nome) return;
      db.materias.push({ nome, horas: 0, marcadas: 0 });
      salvar();
      render();
    }
  });
}

function rem(i) {
  abrirModal({
    titulo: `Remover "${db.materias[i].nome}"?`,
    confirmar: () => {
      db.materias.splice(i, 1);
      salvar();
      render();
    }
  });
}

carregar();