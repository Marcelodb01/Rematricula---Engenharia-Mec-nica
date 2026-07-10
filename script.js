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
let horarios = {};
let modoAdmin = false;

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

document.addEventListener(
"DOMContentLoaded",
()=>{

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

}
);


fetch("horarios.json")
    .then(response => response.json())
    .then(data => {

        horarios = data;

        inserirDias();

    })
    .catch(erro => console.error("Erro ao carregar horarios.json:", erro));

/* =====================================================
   BUSCAR HISTÓRICO
===================================================== */
async function buscarHistorico(){

const codigo=
document
.getElementById(
"codigoAluno"
)
.value
.trim();


if(!codigo){

alert(
"📚 Digite sua matrícula."
);

return;

}


// Cursor de espera
document.body.style.cursor="wait";


try{


const caminho=
`./Alunos/${codigo}.pdf`;


console.log(
"Buscando:",
caminho
);


let arquivo=null;


// tenta buscar automaticamente

const resposta=
await fetch(caminho);



if(resposta.ok){


const blob=
await resposta.blob();


arquivo=
new File(
[blob],
`${codigo}.pdf`,
{
type:"application/pdf"
}
);


console.log(
"Histórico encontrado automaticamente"
);


}
else{


console.log(
"Histórico não encontrado na pasta"
);


// abre busca no computador

alert(
"⚠️ Histórico não encontrado no sistema.\nSelecione o arquivo PDF manualmente."
);


arquivo=
await selecionarHistorico();



if(!arquivo){

throw new Error(
"Nenhum arquivo selecionado"
);

}


}



// carrega histórico

await lerHistoricoPDF(
arquivo
);



document.getElementById(
"btnLimpar"
).disabled=false;


document.getElementById(
"btnMatricula"
).disabled=false;


document.body.style.cursor="default";


alert(
"✅ Histórico carregado."
);



}

catch(e){


console.log(
"Erro:",
e
);


document.body.style.cursor="default";


alert(
"⚠️ Histórico não carregado."
);


}


}


/* =====================================================
   LER HISTÓRICO
===================================================== */

async function lerHistoricoPDF(
arquivo
){

if(!arquivo) return;

try{

const palavras=
await lerPDF(
arquivo
);

nomeAluno=
extrairNomeAluno(
palavras
);

document.getElementById(
"dadosAluno"
).innerHTML=
`👤 Aluno: <strong>${nomeAluno}</strong>`;
/* procura nome do aluno dentro do PDF */

nomeAluno=
extrairNomeAluno(
palavras
);

/* atualiza tela */

document.getElementById(
"dadosAluno"
).innerHTML=
`👤 Aluno: <strong>${nomeAluno}</strong>`;


/* limpa os checkboxes */

document.querySelectorAll('input[type="checkbox"]').forEach(cb=>{

    cb.checked = false;

    // Todas as disciplinas começam habilitadas
    cb.disabled = false;

    const label = cb.parentElement;

    label.classList.remove(
        "concluida",
        "reprovada",
        "aproveitamento",
        "aprovado-com-reprovacao"
    );

});

const resultados=
extrairSituacoesDisciplinas(
palavras
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

}
catch(e){

console.log(e);

alert(
"Erro ao ler PDF."
);

}

}

/* =====================================================
   EXTRAI NOME DO ALUNO
===================================================== */

function extrairNomeAluno(
palavras
){

const textoCompleto=
palavras.join(" ");

const regex=
/([A-ZÀ-Ú][A-Za-zÀ-ú\s]+)\s*\(\d{5}[A-Z]{2}\.[A-Z]{2}\d+\)/i;

const resultado=
textoCompleto.match(
regex
);

if(
resultado &&
resultado[1]
){

let nome=
resultado[1]
.trim();

/* remove palavras indesejadas */

nome=
nome.replace(
/^(Matriculado|MATRICULADO|Aluno|ALUNO)\s+/i,
""
);

return nome;

}

return "Aluno não identificado";

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

document.querySelectorAll('input[type="checkbox"]').forEach(cb=>{

    cb.checked = false;
    cb.disabled = false;

    const label = cb.parentElement;

    label.classList.remove(
        "concluida",
        "reprovada",
        "aproveitamento",
        "aprovado-com-reprovacao"
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

const disciplina = Array.from(label.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent.trim())
    .join(" ")
    .trim();

if(
status==="aprovado" ||
status==="aproveitamento"
){

checkbox.checked = true;

if(!modoAdmin){
    checkbox.disabled = true;
}

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
   VERIFICA CONFLITOS DE HORÁRIO
===================================================== */
function verificarConflitosHorarios(selecionadas){

    let conflitos=[];

    for(let i=0;i<selecionadas.length;i++){

        const codigo1=selecionadas[i].dataset.codigo;

        if(!horarios[codigo1]) continue;

        const dia1=horarios[codigo1].dia.trim().substring(0,3).toUpperCase();

        const horario1=horarios[codigo1].horario
            .replace(/\s+/g,"")
            .toUpperCase();

        for(let j=i+1;j<selecionadas.length;j++){

            const codigo2=selecionadas[j].dataset.codigo;

            if(!horarios[codigo2]) continue;

            const dia2=horarios[codigo2].dia.trim().substring(0,3).toUpperCase();

            const horario2=horarios[codigo2].horario
                .replace(/\s+/g,"")
                .toUpperCase();

            if(
                dia1===dia2 &&
                horario1===horario2
            ){

                const nome1=Array.from(selecionadas[i].parentElement.childNodes)
                .filter(n=>n.nodeType===Node.TEXT_NODE)
                .map(n=>n.textContent.trim())
                .join(" ")
                .trim();

                const nome2=Array.from(selecionadas[j].parentElement.childNodes)
                .filter(n=>n.nodeType===Node.TEXT_NODE)
                .map(n=>n.textContent.trim())
                .join(" ")
                .trim();

                conflitos.push({

                    disciplina1:nome1,
                    disciplina2:nome2,
                    dia:horarios[codigo1].dia.trim(),
                    horario:horarios[codigo1].horario.trim()

                });

            }

        }

    }

    return conflitos;

}

/* =====================================================
   MATRÍCULA
===================================================== */
function Matricula(){

// ==========================================
// Atualiza as disciplinas concluídas
// (inclui as marcadas pelo administrador)
// ==========================================

disciplinasConcluidas = [];

document
.querySelectorAll('input[type="checkbox"]:checked')
.forEach(cb=>{

    const disciplina = Array.from(cb.parentElement.childNodes)
        .filter(node=>node.nodeType===Node.TEXT_NODE)
        .map(node=>node.textContent.trim())
        .join(" ")
        .trim();

    disciplinasConcluidas.push(disciplina);

});

    // ==========================================
    // Disciplinas selecionadas para matrícula
    // ==========================================

console.log("Disciplinas concluídas:", disciplinasConcluidas);

    const selecionadas = Array.from(
        document.querySelectorAll(
            'input[type="checkbox"]:checked:not(:disabled)'
        )
    );

    // Nenhuma disciplina selecionada
    if(selecionadas.length === 0){

        alert("📚 Selecione pelo menos uma disciplina para rematrícula.");
        return;

    }

    /* ==========================================
       VERIFICA CONFLITO DE HORÁRIOS
    ========================================== */

    const conflitos = verificarConflitosHorarios(selecionadas);

    if(conflitos.length > 0){

        let mensagem = "⚠ Existem conflitos de horário.\n\n";

        conflitos.forEach(c=>{

            mensagem +=
`${c.disciplina1}

X

${c.disciplina2}

${c.dia} ${c.horario}

`;

        });

        alert(mensagem);
        return;

    }

    /* ==========================================
       VERIFICA PRÉ-REQUISITOS
    ========================================== */

    let liberadas = [];
    let bloqueadas = [];

    selecionadas.forEach(cb=>{

        const label = cb.parentElement;

        // Nome da disciplina (sem o span do horário)
        const disciplina = Array.from(label.childNodes)
            .filter(node=>node.nodeType===Node.TEXT_NODE)
            .map(node=>node.textContent.trim())
            .join(" ")
            .trim();

        const reqs = prerequisitos[disciplina];

        if(!reqs){

            liberadas.push(disciplina);
            return;

        }

        const pendentes = reqs.filter(req=>
            !disciplinasConcluidas.includes(req)
        );

        if(pendentes.length===0){

            liberadas.push(disciplina);

        }else{

            bloqueadas.push({

                disciplina,
                pendencias:pendentes

            });

        }

    });

    /* ==========================================
       CONSOLE
    ========================================== */

    console.clear();

    console.log("======== DISCIPLINAS LIBERADAS ========");

    liberadas.forEach(d=>{

        console.log("✓", d);

    });

    console.log("======== DISCIPLINAS BLOQUEADAS ========");

    bloqueadas.forEach(d=>{

        console.log(
            "✗",
            d.disciplina,
            "| Falta:",
            d.pendencias.join(", ")
        );

    });

    /* ==========================================
       MENSAGEM
    ========================================== */

    let msg = "";

    if(liberadas.length){

        msg +=
        "DISCIPLINAS LIBERADAS\n\n"+
        liberadas.join("\n");

    }

    if(bloqueadas.length){

        msg += "\n\nDISCIPLINAS BLOQUEADAS\n\n";

        bloqueadas.forEach(d=>{

            msg +=
`${d.disciplina}
(Falta: ${d.pendencias.join(", ")})

`;

        });

    }

    const gerar = confirm(
        msg + "\n\nDeseja gerar o relatório em PDF?"
    );

    if(gerar){

        gerarPDFHistorico(
            liberadas,
            bloqueadas
        );

    }

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

disciplinasLiberadas.forEach(d => {

    if (y > 270) {

        doc.addPage();
        y = 20;

    }

    // Nome da disciplina
    doc.text("• " + d, 25, y);

    // Procura o código da disciplina no HTML
    const checkbox = Array.from(
        document.querySelectorAll("input[data-codigo]")
    ).find(cb => {

        const nome = Array.from(cb.parentElement.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .join(" ")
            .trim();

        return nome === d;

    });

    // Imprime o dia e horário somente para as disciplinas liberadas
    if (checkbox) {

        const codigo = checkbox.dataset.codigo;

        if (horarios[codigo]) {

            const textoHorario =
                `${horarios[codigo].dia} • ${horarios[codigo].horario}`;

            // Alinha à direita na mesma linha
            doc.text(
                textoHorario,
                140,
                y
            );

        }

    }

    y += 8;

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

function inserirDias() {

    document.querySelectorAll("input[data-codigo]").forEach(input => {

        const codigo = input.dataset.codigo;

        if (!horarios[codigo]) return;

        const info = horarios[codigo];

        const span = document.createElement("span");
        span.className = "diaSemana";
        span.textContent = `${info.dia} • ${info.horario}`;

        input.parentElement.appendChild(span);

    });

}

function loginAdmin(){

    // ======================================
    // SAIR DO MODO ADMIN
    // ======================================

    if(modoAdmin){

        if(!confirm("Deseja sair do modo administrador?")){
            return;
        }

        modoAdmin = false;

        document.body.classList.remove("admin");

        document.getElementById("modoAdmin").style.display = "none";

        document.getElementById("btnAdmin").innerHTML =
        "🔒 Área Administrativa";

        document.getElementById("btnAdmin").style.background =
        "#ff9800";

        // Bloqueia novamente apenas as disciplinas concluídas
        document.querySelectorAll('input[type="checkbox"]').forEach(cb=>{

            if(cb.checked){

                cb.disabled = true;

            }else{

                cb.disabled = false;

            }

        });

        alert("Modo administrador desativado.");

        return;

    }

    // ======================================
    // LOGIN
    // ======================================

    const senha = prompt("Senha do Coordenador:");

    if(senha !== "123456"){

        alert("Senha incorreta.");

        return;

    }

    // ======================================
    // ATIVA MODO ADMIN
    // ======================================

    modoAdmin = true;

    document.body.classList.add("admin");

    document.getElementById("modoAdmin").style.display = "flex";

    document.getElementById("btnAdmin").innerHTML =
    "🔓 Sair do Modo Admin";

    document.getElementById("btnAdmin").style.background =
    "#d32f2f";

    // Libera todos os checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb=>{

        cb.disabled = false;

        cb.onchange = function(){

            if(!modoAdmin) return;

            const label = this.parentElement;

            // Nome da disciplina
            const disciplina = Array.from(label.childNodes)
            .filter(node=>node.nodeType===Node.TEXT_NODE)
            .map(node=>node.textContent.trim())
            .join(" ")
            .trim();

            if(this.checked){

                // Cor laranja
                label.classList.add("adicionadaAdmin");

                // Adiciona à lista de disciplinas concluídas
                if(!disciplinasConcluidas.includes(disciplina)){

                    disciplinasConcluidas.push(disciplina);

                }

            }else{

                // Remove cor
                label.classList.remove("adicionadaAdmin");

                // Remove da lista
                disciplinasConcluidas =
                disciplinasConcluidas.filter(d=>d!==disciplina);

            }

            console.log(disciplinasConcluidas);

        };

    });

    alert("Modo administrador ativado.");

}

function selecionarHistorico(){

return new Promise((resolve)=>{

const input=
document.getElementById(
"arquivoHistorico"
);


input.value="";


input.onchange=()=>{

if(input.files.length){

resolve(
input.files[0]
);

}else{

resolve(null);

}

};


input.click();


});

}
