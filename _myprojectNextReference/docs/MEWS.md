# Modified Early Warning Score (MEWS) - Padrão VigiDoc

Este documento descreve a adoção do escore MEWS (Modified Early Warning Score) no projeto VigiDoc para alertar a equipe médica e de enfermagem baseando-se nos sinais vitais do paciente.

## Sistema de 4 Cores

O sistema divide o estado clínico dos pacientes em **4 níveis de alerta** com base nos sinais vitais coletados. As categorias são definidas por faixas de valores e cada perfil exige um tipo diferente de intervenção.

### 🟢 Verde (Normal)
- **Condição:** Todos os sinais vitais estão dentro da faixa de normalidade.
- **Intervenção:** Sem necessidade de intervenção. Monitoramento de rotina.

### 🟡 Amarelo (Atenção Leve)
- **Condição:** Sinais vitais com leves alterações estruturais.
- **Intervenção:** Necessidade de intervenção simples e contato com o paciente. Se uma segunda aferição vier alterada, requer avaliação pela enfermeira.

### 🟠 Laranja (Alerta Moderado)
- **Condição:** Sinais moderadamente alterados.
- **Intervenção:** Necessidade imediata de intervenção, avaliação primária pela equipe de enfermagem.

### 🔴 Vermelho (Crítico)
- **Condição:** Alguns, ou somente um único sinal vital, apresentando grandes variações críticas.
- **Intervenção:** Necessidade urgente de intervenção médica, com avaliação de possível encaminhamento hospitalar.

---

## Faixas de Sinais Vitais (Ranges)

Os parâmetros implementados no código (`lib/utils/vitals.ts`) seguem a lógica descrita abaixo para classificar a severidade (cor) para cada registro específico.

### Frequência Cardíaca (FC) - bpm
| Cor | Faixa |
|---|---|
| 🟢 **Verde** | 51 – 100 |
| 🟡 **Amarelo** | 41 – 50 `ou` 101 – 110 |
| 🟠 **Laranja** | ≤ 40 `ou` 111 – 129 |
| 🔴 **Vermelho** | ≥ 130 |

### Saturação de Oxigênio (SpO2) - %
| Cor | Faixa |
|---|---|
| 🟢 **Verde** | ≥ 96% |
| 🟡 **Amarelo** | 94% – 95% |
| 🟠 **Laranja** | 92% – 93% |
| 🔴 **Vermelho** | ≤ 91% |

### Temperatura (Tª) - °C
*Nota: Para temperatura, os alertas param na faixa Laranja como de maior risco definido por padrão inicial.*
| Cor | Faixa |
|---|---|
| 🟢 **Verde** | 36,1 – 37,9 |
| 🟡 **Amarelo** | 35,1 – 36,0 `ou` 38,0 – 38,9 |
| 🟠 **Laranja** | < 35,0 `ou` > 39,0 |

### Pressão Arterial Sistólica (PAS) - mmHg
*Nota: Limites de estabilização padrão (ajustáveis).*
| Cor | Faixa |
|---|---|
| 🟢 **Verde** | 101 – 179 |
| 🟡 **Amarelo** | 81 – 100 |
| 🟠 **Laranja** | 71 – 80 `ou` 180 – 199 |
| 🔴 **Vermelho** | ≤ 70 `ou` ≥ 200 |

### Frequência Respiratória (FR) e Estado Neurológico (SNC)
**Status:** Não implementados nesta versão inicial.
Ambas as medidas fazem parte do cálculo global do MEWS, mas ainda aguardam adição ao schema de banco de dados (`VitalRecord`) para entrarem em vigor nativamente no Dashboard.
