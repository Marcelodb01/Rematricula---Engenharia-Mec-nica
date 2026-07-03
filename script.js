/* =====================================================
   PDF.JS – CONFIGURAÇÃO
===================================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/* =====================================================
   ARMAZENAMENTO
===================================================== */

let disciplinasConcluidas=[];
let nomeAluno="";

/* =====================================================
   PRÉ-REQUISITOS
===================================================== */

const prerequisitos={

"Calculo II":["Calculo I"],
"Fisica II":["Fisica I"],
"Desenho Computacional I":["Desenho Tecnico","Info Instrumental"],
"Calculo III":["Calculo II"],
"Fisica III":["Fisica II"],
"Ciencias dos Materiais":["Quimica Geral"],

"Resistencia dos Materiais":["Elementos de Maquinas","Fisica I","Algebra Linear e Geom. Analitica"],

"Desenho Computacional II":["Desenho Computacional I"],

"Mecanica dos Fluidos":["Fisica I","Quimica Geral"],

"Termodinamica Aplicada":["Fisica II"],

"Eng. Economica":["Info Instrumental"],

"Eletricidade Aplicada":["Fisica III"],

"Algoritimos de Programacao":["Info Instrumental"],

"Projeto Integrador I":["Elementos de Maquinas","Desenho Computacional II"],

"Calculo Numerico":["Algebra Linear e Geom. Analitica","Calculo II"],

"Maquinas Termicas":["Fisica II","Termodinamica Aplicada","Calculo II"],

"Maquinas de Fluxo":["Mecanica dos Fluidos"],

"Mecanismos":["Elementos de Maquinas","Calculo I","Fisica I"],

"Usinagem I":["Elementos de Maquinas","Resistencia dos Materiais"],

"Processos Metalurgicos":["Elementos de Maquinas","Desenho Computacional II","Resistencia dos Materiais"],

"Transferencia de Calor e Massa":["Fisica II","Termodinamica Aplicada"],

"Acionamentos Eletricos e Motores":["Fisica III","Ciencias dos Materiais","Calculo I"],

"Soldagem e Tratamentos Termicos":["Elementos de Maquinas","Resistencia dos Materiais","Desenho Computacional II" ],

"Usinagem II":["Usinagem I"],

"Estatistica e Probabilidade":["Calculo I","Info Instrumental"],

"Introducao a Automacao":["Algoritimos de Programacao","Eletricidade Aplicada"],

"Projeto Integrador II":["Mecanica dos Fluidos","Termodinamica Aplicada"],

"Refrigeracao e Climatizacao":["Fisica II","Transferencia de Calor e Massa","Maquinas de Fluxo"],

"Automacao Industrial I":["Introducao a Automacao"],

"Projeto Integrador III":["Usinagem II","Automacao Industrial I", "Fisica I"],

"Trocadores de Calor":["Fisica II","Termodinamica Aplicada"],

"Mecanica Vibratoria": ["Calculo III","Fisica I"],

"Refrigeração Comercial":["Refrigeracao e Climatizacao"],

"Climatizacao I":["Refrigeracao e Climatizacao"],

"SHP II":["SHP I"],

"Manutenção Industrial":["Elementos de Maquinas","Info Instrumental", "Eletricidade Aplicada","Desenho Computacional I"],

"Automacao Industrial II": ["Automacao Industrial I"],

"Topicos Avancados em Eletronica e Automacao":["Automacao Industrial II"],


};

/* =====================================================
   DOM
===================================================== */

document.addEventListener("DOMContentLoaded",()=>{

document.querySelectorAll(
'input[type="checkbox"]'
).forEach(cb=>{

cb.checked=false;
cb.disabled=true;

});

document.getElementById(
"btnLimpar"
).disabled=true;

document.getElementById(
"btnMatricula"
).disabled=true;

/* ao selecionar arquivo, lê automaticamente */

document
.getElementById(
"arquivo"
)
.addEventListener(
"change",
lerHistoricoPDF
);

});


/* =====================================================
   LER HISTÓRICO
===================================================== */

async function lerHistoricoPDF(){

const arquivo=
document.getElementById(
"arquivo"
).files[0];

if(!arquivo){

alert(
"Selecione um histórico PDF."
);

return;

}

nomeAluno=
arquivo.name
.replace(".pdf","")
.replace(".PDF","")
.trim();

try{

const palavras=
await lerPDF(
arquivo
);

document.querySelectorAll(
'input[type="checkbox"]'
).forEach(cb=>{

cb.disabled=false;

});

const resultados=
extrairSituacoesDisciplinas(
palavras
);

console.log(
"Resultados:",
resultados
);

marcarCheckboxes(
resultados
);

document.getElementById(
"btnLimpar"
).disabled=false;

document.getElementById(
"btnMatricula"
).disabled=false;



}catch(e){

console.error(e);

alert(
"Erro ao ler PDF."
);

}

}


/* =====================================================
   LEITOR PDF
===================================================== */

async function lerPDF(file){

const buffer=
await file.arrayBuffer();

const pdf=
await pdfjsLib
.getDocument({
data:buffer
})
.promise;

const palavras=[];

for(
let p=1;
p<=pdf.numPages;
p++
){

const page=
await pdf.getPage(p);

const content=
await page.getTextContent();

content.items.forEach(
item=>{

if(item.str){

palavras.push(
item.str.trim()
);

}

});

}

return palavras;

}


/* =====================================================
   EXTRAI DISCIPLINAS
===================================================== */

function extrairSituacoesDisciplinas(palavras){

const disciplinas={};

const lista=
palavras
.map(p=>p.trim())
.filter(p=>p!="");

for(
let i=0;
i<lista.length;
i++
){

const codigoMatch=
lista[i].match(
/SUP\.\d+/i
);

if(codigoMatch){

const codigo=
codigoMatch[0]
.toUpperCase();

let status=null;

/* procura apenas até encontrar outro SUP */

for(
let j=i+1;
j<lista.length;
j++
){

const texto=
lista[j];

/* chegou na próxima disciplina */
if(
/SUP\.\d+/i.test(
texto
)
){
break;
}

if(
/Aprovado/i.test(
texto
)
){

status="aprovado";
break;

}

if(
/Aproveit/i.test(
texto
)
){

status="aproveitamento";
break;

}

if(
/Reprovado/i.test(
texto
)
){

status="reprovado";
break;

}

}

if(status){

disciplinas[
codigo
]=status;

}

}

}

const resultado=
Object.entries(
disciplinas
).map(
([codigo,status])=>({

codigo,
status

})
);

console.log(
"Disciplinas encontradas:",
resultado
);

return resultado;

}

/* =====================================================
   MARCAR DISCIPLINAS
===================================================== */

function marcarCheckboxes(resultados){

disciplinasConcluidas=[];

/* limpa estados antigos */

document.querySelectorAll(
'input[type="checkbox"]'
).forEach(cb=>{

cb.checked=false;

const label=
cb.parentElement;

label.classList.remove(
"concluida",
"reprovada"
);

});

resultados.forEach(
({codigo,status})=>{

const checkbox=
document.querySelector(
`input[data-codigo="${codigo}"]`
);

if(!checkbox){

console.log(
"Código não encontrado:",
codigo
);

return;

}

const label=
checkbox.parentElement;

const disciplina=
label.textContent
.trim();

if(
status==="aprovado" ||
status==="aproveitamento"
){

checkbox.checked=true;

checkbox.disabled=true;

label.classList.add(
"concluida"
);

disciplinasConcluidas.push(
disciplina
);

}

else if(
status==="reprovado"
){

label.classList.add(
"reprovada"
);

}

});

console.log(
"Concluídas:",
disciplinasConcluidas
);

}

/* =====================================================
   MATRÍCULA
===================================================== */
function Matricula(){

const selecionadas=
Array.from(
document.querySelectorAll(
'input[type="checkbox"]:checked:not(:disabled)'
)
);

if(
selecionadas.length===0
){

alert(
"📚 Selecione pelo menos uma disciplina para rematrícula."
);

return;

}

let liberadas=[];
let bloqueadas=[];

selecionadas.forEach(cb=>{

const disciplina=
cb.parentElement
.textContent
.trim();

const reqs=
prerequisitos[
disciplina
];

if(!reqs){

liberadas.push(
disciplina
);

return;

}

const pendentes=
reqs.filter(
req=>
!disciplinasConcluidas.includes(
req
)
);

if(
pendentes.length===0
){

liberadas.push(
disciplina
);

}else{

bloqueadas.push({

disciplina,
pendencias:pendentes

});

}

});

/* ===== Console ===== */

console.clear();

console.log(
"======== DISCIPLINAS LIBERADAS ========"
);

liberadas.forEach(d=>{

console.log(
"✓",
d
);

});

console.log(
"======== DISCIPLINAS BLOQUEADAS ========"
);

bloqueadas.forEach(d=>{

console.log(
"✗",
d.disciplina,
"| Falta:",
d.pendencias.join(", ")
);

});

/* ===== Alert ===== */

let msg="";

if(
liberadas.length
){

msg+=
"DISCIPLINAS LIBERADAS\n\n"+
liberadas.join("\n");

}

if(
bloqueadas.length
){

msg+=
"\n\nDISCIPLINAS BLOQUEADAS\n\n";

bloqueadas.forEach(d=>{

msg+=
`${d.disciplina}
(Falta: ${d.pendencias.join(", ")})

`;

});

}

alert(msg);

/* PDF */

gerarPDFHistorico(
liberadas,
bloqueadas
);

}


/* =====================================================
   GERAR PDF
===================================================== */
function gerarPDFHistorico(
disciplinasLiberadas,
disciplinasBloqueadas
){

const {jsPDF}=
window.jspdf;

const doc=
new jsPDF();

let y=20;

doc.setFontSize(16);

doc.text(
`Relatorio Academico - ${nomeAluno}`,
20,
y
);

y+=20;


/* ======================
   DISCIPLINAS CURSADAS
====================== */

doc.setFontSize(12);

doc.text(
"Disciplinas Cursadas",
20,
y
);

y+=10;

[...new Set(
disciplinasConcluidas
)]
.forEach(d=>{

if(y>270){

doc.addPage();

y=20;

}

doc.text(
"• "+d,
25,
y
);

y+=8;

});

y+=15;


/* ======================
   DISCIPLINAS LIBERADAS
====================== */

doc.text(
"Disciplinas Liberadas para Matricula:",
20,
y
);

y+=10;

disciplinasLiberadas
.forEach(d=>{

if(y>270){

doc.addPage();

y=20;

}

doc.text(
"• "+d,
25,
y
);

y+=8;

});

y+=15;


/* ======================
   DISCIPLINAS BLOQUEADAS
====================== */

doc.text(
"Disciplinas Bloqueadas",
20,
y
);

y+=10;

disciplinasBloqueadas
.forEach(d=>{

if(y>270){

doc.addPage();

y=20;

}

doc.text(
`• ${d.disciplina}`,
25,
y
);

y+=8;

doc.text(
`Pré-requisito pendente: ${d.pendencias.join(", ")}`,
35,
y
);

y+=10;

});

doc.save(
"historico_matricula.pdf"
);

}

/* =====================================================
   LIMPAR
===================================================== */

function LimparTeste(){

location.reload();

}