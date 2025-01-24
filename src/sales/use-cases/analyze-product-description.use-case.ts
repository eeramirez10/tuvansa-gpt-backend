import OpenAI from 'openai';

interface ReturnProps {
  product: string;
  ced: string;
  diameter: string;
  costura?: string;
  material?: string;
  ranurado?: string;
  galvanizado?: string;
  roscado?: string;
  pulgada: string;
  liso: string;
  tramos?: string;
  negro?: string;
  toSearch: string;
  sw?: string;
  peso?: string;
  material_especifico?: string;
  tamaño?: string;
  angulo?: string;
  presion?: string;
  tipo_inicial?: string;
}

const listadoProductos = `
TUBO
BRIDA
CODO
CONECTOR
COPLE
COPLE REDUCIDO
CRUZ
FILTRO
INSERTO REDUCIDO
MAQUINA RANURADORA
MEDIO COPLE
NIPLE
REDUCCION 
REDUCCION BUSHING
REDUCCION CAMPANA
REDUCCION CONCENTRICA
REDUCCION EXCENTRICA
ROCIADOR PENDIENTE
TEE MECANICA
SOCKOLET
TAPA O TAPON
TAPA O TAPON CAPA
TAPON MACHO
TEE
TEE MECANICA
TEE RECTA HDPE
TEE RED O TEE REDUCIDA
THREDOLET
TUERCA UNION
GUARDA
JUNTA DE EXPANSION
JUNTA FLEXIBLE
MANGUERA
STUB
STUB END HDPE
SWAGE CONCENTRICO
SWAGE
WELDOLET
BARRA HUECA
BARRA HUECA EN CALIENTE
TUBO DE HDPE
TUBO MECANICO
TRIM
VALVULA
VALVULA AGUJA
VALVULA BOLA
VALVULA COMPUERTA
VALVULA MARIPOSA
VALVULA CHECK
VALVULA BALANCEO
VALVULA CUCHILLA
VALVULA ALARMA
VALVULA DUO
VALVULA ELIMINADORA
VALVULA GLOBO
VALVULA MACHO
VALVULA P


`;

const iniciales = {
  TUBO: 'T',
  BRIDA: 'B',
  CODO: 'C',
  CONECTOR: 'CO',
  COPLE: 'CP',
  CRUZ: 'CZ',
  FILTRO: 'FI',
  'INSERTO REDUCIDO': 'INR',
  'MAQUINA RANURADORA': 'MRA',
  'MEDIO COPLE': 'MC',
  NIPLE: 'NI',
  'REDUCCION O RED BUSHING': 'RB',
  'REDUCCION CAMPANA': 'RCA',
  'REDUCCION CONCENTRICA': 'RC',
  'REDUCCION EXCENTRICA': 'RE',
  'ROCIADOR PENDIENTE': 'RPE',
  'TEE MECANICA': 'TEM',
  SOCKOLET: 'SK',
  'TAPA O TAPON': 'TP',
  'TAPA O TAPON CAPA': 'TAC',
  'TAPON MACHO': 'TAM',
  TEE: 'TE',
  'TEE RECTA HDPE': 'TEHDP',
  'TEE RED O TEE REDUCIDA': 'TER',
  THREDOLET: 'TH',
  'TUERCA UNION': 'TU',
  GUARDA: 'GU',
  'JUNTA DE EXPANSION': 'JE',
  'JUNTA FLEXIBLE': 'JF',
  MANGUERA: 'MA',
  STUB: 'ST',
  'STUB END HDPE': 'STHD',
  SWAGE: 'SW',
  'SWAGE CONCENTRICO': 'SWC',
  WELDOLET: 'WE',
  'BARRA HUECA': 'BAH',
  'BARRA HUECA EN CALIENTE': 'BHC',
  'TUBO DE HDPE': 'THDP',
  'TUBO MECANICO': 'TME',
  TRIM: 'TRIM',
  VALVULA: 'V',
  'VALVULA BOLA': 'VB',
  'VALVULA COMPUERTA': 'VC',
  'VALVULA MARIPOSA': 'VMA',
  'VALVULA CHECK': 'VCH',
  'VALVULA BALANCEO': 'VBA',
  'VALVULA CUCHILLA': 'VCU',
  'VALVULA ALARMA': 'VAL',
  'VALVULA DUO': 'VD',
  'VALVULA ELIMINADORA': 'VE',
  'VALVULA GLOBO': 'VG',
  'VALVULA MACHO': 'VM',
  'VALVULA P': 'VPIE',
};

export const analyzeProductDescriptionUseCase = async (
  openai: OpenAI,
  productDescription: string,
): Promise<any> => {
  // const contentOriginal = `Extrae la siguiente información del producto:
  //                 - Tipo de producto (busca palabras clave como CODO, TUBO, TEE, REDUCCIÓN, etc. Si aparece "tubería", entonces "TUBO" o similar).
  //                 - Cédula (busca variantes como C, ced, cedula, Sch, STD) solo extrae el valor numerico Si viene STD es STANDARD lo que significa que siempre va a ser 40
  //                 - Diámetro Nominal (pulgadas) pon el simbolo de " en vez de pulgadas
  //                 - Pulgada Aqui ponme el Diametro Nominal sin el simbolo "
  //                 - Tipo de costura (con costura o sin costura, busca variantes como cc, c.c, sc, s.c)
  //                   si es con costura entonces es TCC y si es sin ccostura TSC
  //                 - Material {
  //                   1. acero al carbón o sus variantes como ac, a.c, AC, a/c, A/C )
  //                   2. Acero Aleado variantes al, a.l a/l
  //                   3. Acero Inoxidable variantes ai, a.i a/i,
  //                   4. Acero para soldar variantes apd, a.p.d, A/P/D,
  //                 }
  //                 - Ranurado (busca variantes como RAN, RANURADO, RAN., RAN-R y similares, si está presente pon RA )
  //                 - Galvanizado (busca variantes como GALV, GAL, GALVANIZADO, GALV. y similares, si está presente pon G )
  //                 - Roscado (busca variantes como ROSCADO, ROS., ROSC., y similares, si está presente R)
  //                 - Liso (busca variantes como LISO, LIS., LIS y similares, si está presente L)
  //                 - Tramos (busca variantes como TRAMOS, TM y variantes si esta presente pon TM )
  //                 - Negro (Busca Negro y si esta presente pon N)
  //                 - Socket Well (busca variantes como SW, SOCKET WELL, S.W., etc., si está presente pon SW )
  //                 - Peso (en KGS., busca el valor numerico)
  //                 - Material Específico (como SW T-316, SOCKET WELL T-316, S.W. T-316, etc.) cuando encuentres A o a es Acero
  //                 - Tamaño (en pulgadas, como 1", 2", 1 1/2")
  //                 - Ángulo (en grados, puede estar indicado como 45°, 45 GRADOS, 45o)
  //                 - Presión (en LBS., como 6000 LBS., 300
  //                 - Si no se encuentra pon null a la propiedad
  //                 - Pon todo en mayusculas
  //                 - Quita acentos
  //                 Descripción: "${productDescription}"

  //                 dame la informacion en un objeto json de la siguiente manera

  //                 {
  //                   product: Tipo de producto,
  //                   ced: cedula / si no encuentra cedula entonces null,
  //                   diameter: Diametro,
  //                   costura: tipo de costura si no null,
  //                   material: Material,
  //                   ranurado: Ranurado si no null,
  //                   pulgada: diameter sin " y en string
  //                   roscado: Roscado si no null
  //                   galvanizado: Galvanizado si no null
  //                   liso: Liso si no null
  //                   tramos: Tramos si no null
  //                   negro:Negro si no null
  //                   sw: Socket Well si no null
  //                   peso: Peso si no null
  //                   material_especifico: Material si no null
  //                   tamaño: Tamaño si no null
  //                   angulo: Ángulo con la letra O mayuscula sistituyendo el simbolo de grados si no null
  //                   presion: Presión si no null

  //                 }
  //         `;

  // const content = `Extrae la siguiente información del producto:
  //         - Tipo de producto (Tubo, Tee, Reducción, etc.) si viene tubería entonces TUBO o similares
  //         - Cédula (busca variantes como C, ced, cédula, Sch, STD) solo extrae el valor numérico. Si viene STD es STANDARD, lo que significa que siempre va a ser 40.
  //         - Diámetro Nominal (pulgadas) pon el símbolo de " en vez de pulgadas.
  //         - Pulgada: Aquí ponme el diámetro nominal sin el símbolo ".
  //         - Tipo de costura (con costura o sin costura, busca variantes como cc, c.c, sc, s.c). Si es con costura entonces es TCC y si es sin costura TSC.
  //         - Material:
  //           1. acero al carbón o sus variantes como ac, a.c, AC, a/c, A/C.
  //           2. Acero Aleado variantes al, a.l, a/l.
  //           3. Acero Inoxidable variantes ai, a.i, a/i.
  //           4. Acero para soldar variantes apd, a.p.d, A/P/D.
  //         - Ranurado (busca variantes como RAN, RANURADO, RAN., RAN-R y similares, si está presente pon RA).
  //         - Galvanizado (busca variantes como GALV, GAL, GALVANIZADO, GALV. y similares, si está presente pon G).
  //         - Roscado (busca variantes como ROSCADO, ROS., ROSC., y similares, si está presente R).
  //         - Liso (busca variantes como LISO, LIS., LIS y similares, si está presente L).
  //         - Tramos (busca variantes como TRAMOS, TM y variantes. Si está presente pon TM).
  //         - Negro (Busca Negro y si está presente pon N).
  //         - Socket Well (busca variantes como SW, SOCKET WELL, S.W., etc., si está presente pon SW).
  //         - Peso (en KGS., busca el valor numérico).
  //         - Material Específico (como SW T-316, SOCKET WELL T-316, S.W. T-316, etc.) cuando encuentres A o a es Acero.
  //         - Tamaño (en pulgadas, como 1", 2", 1 1/2").
  //         - Ángulo (en grados, puede estar indicado como 45°, 45 GRADOS, 45o).
  //         - Presión (en LBS., como 6000 LBS., 3000 LBS, etc.).
  //         - Si no se encuentra pon null a la propiedad.
  //         - Pon todo en mayúsculas.
  //         - Quita acentos.
  //         Descripción: "${productDescription}"

  //         Dame la información en un objeto JSON de la siguiente manera:

  //         {
  //           product: Tipo de producto,
  //           ced: cedula / si no encuentra cedula entonces null,
  //           diameter: Diametro,
  //           costura: tipo de costura si no null,
  //           material: Material,
  //           ranurado: Ranurado si no null,
  //           pulgada: diameter sin " y en string,
  //           roscado: Roscado si no null,
  //           galvanizado: Galvanizado si no null,
  //           liso: Liso si no null,
  //           tramos: Tramos si no null,
  //           negro: Negro si no null,
  //           sw: Socket Well si no null,
  //           peso: Peso si no null,
  //           material_especifico: Material específico si no null,
  //           tamaño: Tamaño si no null,
  //           angulo: Ángulo con la letra O mayúscula, sustituyendo el símbolo de grados si no null,
  //           presion: Presión si no null
  //         }`;

  const content2 = `            
            - Tipo de producto (Busca términos como CODO, TUBO, TEE, REDUCCIÓN, CONECTOR, COPLE, CRUZ, etc. Si no está claro, utiliza el más adecuado basado en la descripción. te paso el Listado de productos:

            ${listadoProductos}
     
          - Cédula (
            Busca variantes como C., ced, cedula, Sch, STD, etc. Solo extrae el valor, si no se encuentra, pon null. 
          )
          - Estandar (Busca palabras XXS, XS o SW)
          - Diámetro Nominal (en pulgadas, como 1", 2", 1 1/2", etc. y pon la medida en pulgadas)
          - Pulgada (Aquí pon el diámetro nominal sin connvertir y sin el símbolo de la pulgada.)
          - Radio Largo (Busca Variantes como RL, R.L, R/L)
          - Radio Corto (Busca variantes como RC, R.C, R/C)
          - Tipo de costura (Busca variantes como con costura o sin costura, como cc, c.c, sc, s.c. Si tiene costura, pon CC; si no tiene costura, pon SC.)
          - Material (Busca variantes como acero al carbón, acero inoxidable,hierro maleable, fierro, bronce, ppr, pvc  etc.)
            1. Acero al carbón: ac, a.c, AC, etc.
            2. Acero aleado: al, a.l, a/l
            3. Acero inoxidable: ai, a.i, a/i
            4. Acero para soldar: apd, a.p.d, A/P/D
          - Ranurado (Busca variantes como RAN, RANURADO, RAN., etc. Si está presente, pon RA.)
          - Galvanizado (Busca variantes como GALV, GAL, GALVANIZADO, GALV., etc. Si está presente, pon G.)
          - Roscado (Busca variantes como ROSCADO, ROS., ROSC., etc. Si está presente, pon R.)
          - Liso (Busca variantes como LISO, LIS., LIS, etc. Si está presente, pon L.)
          - Tramos (Busca variantes como TRAMOS, TM, etc. Si está presente, pon TM.)
          - Negro (Si está presente, pon N.)
          - Pesado (busca palabras como pesado si esta presente pon P)
          - Socket Well (Encuentra varianets como SW, SOCKET WELL, Y SI ESTA PRESENTE PON SOCKET WELL )
          - Peso (Busca el valor numérico en KGS.)
          - Material Específico (Como SW T-316, SOCKET WELL T-316, etc.)
          - Ángulo (En grados, como 45°, 45 GRADOS, 45o.) sin el simbolo de grados
          - Presión (En LBS., como 6000 LBS., 3000 LBS., etc.)
          - Figura (Busca variantes como Figura, Fig F. y pon el valor con la F mayuscula al principio sin punto )
          - PVC (Busca palabras como pvc y si esta presente ponlo)
 
          - Pon todo en mayúsculas y quita los acentos.
          
          Descripción: "${productDescription}"

          Dame la información en un objeto JSON como este:
          {
            product: Tipo de producto,
            ced: cédula (si no encuentra cédula, pon null),
            estandar: Estandar
            diameter: Diámetro Nominal
            diameter2: Diametro Nominal despues de la X
            costura: tipo de costura (si no se encuentra, pon null),
            material: material (si no se encuentra, pon null),
            inicial_material: null
            ranurado: ranurado (si no se encuentra, pon null),
            roscado: roscado (si no se encuentra, pon null),
            galvanizado: galvanizado (si no se encuentra, pon null),
            liso: liso (si no se encuentra, pon null),
            tramos: tramos (si no se encuentra, pon null),
            negro: negro (si no se encuentra, pon null),
            peso: peso (si no se encuentra, pon null),
            pesado: Pesado (si no se encuentra entonces null)
            material_especifico: material específico (si no se encuentra, pon null),
            angulo: angulo (si no se encuentra, pon null),
            presion: presión el puro valor  (si no se encuentra, pon null),
            figura: Figura
            radio_corto: Radio Corto (si no se encuentra, pon null)
            radio_largo: Radio Largo (si no se encuentra, pon null)
            pvc: PVC
      
          }

  
  `;

  const content3 = `
  Extrae la siguiente información del producto:
        - Tipo de producto (Busca términos como CODO, TUBO, TEE, REDUCCIÓN, CONECTOR, COPLE, CRUZ, etc. Si no está claro, utiliza el más adecuado basado en la descripción. Ejemplo:
            - CONECTOR ELECTRICO VICTAULIC FIG.47GT → CONECTOR
            - CODO 90 GRADOS → CODO, también busca variantes como COD, C.DO, etc.
            - TUBO → TUBO, también busca variantes como TUB, TBA, etc.
            - REDUCCIÓN → REDUCCIÓN, también busca variantes como RED, RDU, etc.
            - CRUZ → CRUZ, también busca variantes como CRZ, etc.
            - TEE → TEE, también busca variantes como T, TEE, Tee, etc.
            - VARIANTES:
                - CONECTOR: CON, CDO, CONE, CONECT
                - CODO: COD, C.DO, CDO90
                - TUBO: TB, TUB, TUBO
                - REDUCCIÓN: RED, RDU, REDUC, BUSH, BUSHING
                - CRUZ: CRZ, CROSS
                - TEE: T, TEE, Tee, TEE 90
        - Cédula (Busca variantes como C, ced, cedula, Sch, STD, etc. Solo extrae el valor numérico, si no se encuentra, pon null.)
        - Diámetro Nominal (en pulgadas, como 1", 2", 1 1/2", etc.)
        - Pulgada (Aquí pon el diámetro nominal sin el símbolo de la pulgada.)
        - Tipo de costura (Busca variantes como con costura o sin costura, como cc, c.c, sc, s.c. Si tiene costura, pon TCC; si no tiene costura, pon TSC.)
        - Material (Busca variantes como acero al carbón, acero inoxidable, etc.)
          1. Acero al carbón: ac, a.c, AC, etc.
          2. Acero aleado: al, a.l, a/l
          3. Acero inoxidable: ai, a.i, a/i
          4. Acero para soldar: apd, a.p.d, A/P/D
        - Ranurado (Busca variantes como RAN, RANURADO, RAN., etc. Si está presente, pon RA.)
        - Galvanizado (Busca variantes como GALV, GAL, GALVANIZADO, GALV., etc. Si está presente, pon G.)
        - Roscado (Busca variantes como ROSCADO, ROS., ROSC., etc. Si está presente, pon R.)
        - Liso (Busca variantes como LISO, LIS., LIS, etc. Si está presente, pon L.)
        - Tramos (Busca variantes como TRAMOS, TM, etc. Si está presente, pon TM.)
        - Negro (Si está presente, pon N.)
        - Socket Well (Busca variantes como SW, SOCKET WELL, S.W., etc. Si está presente, pon SW.)
        - Peso (Busca el valor numérico en KGS.)
        - Material Específico (Como SW T-316, SOCKET WELL T-316, etc.)
        - Tamaño (En pulgadas, como 1", 2", 3", etc.)
        - Ángulo (En grados, como 45°, 45 GRADOS, 45o.)
        - Presión (En LBS., como 6000 LBS., 3000 LBS., etc.)
        - Si no se encuentra, pon null a la propiedad.
        - Pon todo en mayúsculas y quita los acentos.
        
        Descripción: "${productDescription}"

        Dame la información en un objeto JSON como este:
        {
          product: Tipo de producto (Ejemplo: CONECTOR, COPLE, TEE, CODO, TUBO, REDUCCIÓN, etc.),
          ced: cédula (si no encuentra cédula, pon null),
          diameter: diámetro,
          costura: tipo de costura (si no se encuentra, pon null),
          material: material (si no se encuentra, pon null),
          ranurado: ranurado (si no se encuentra, pon null),
          pulgada: diámetro sin el símbolo de pulgada,
          roscado: roscado (si no se encuentra, pon null),
          galvanizado: galvanizado (si no se encuentra, pon null),
          liso: liso (si no se encuentra, pon null),
          tramos: tramos (si no se encuentra, pon null),
          negro: negro (si no se encuentra, pon null),
          sw: socket well (si no se encuentra, pon null),
          peso: peso (si no se encuentra, pon null),
          material_especifico: material específico (si no se encuentra, pon null),
          tamaño: tamaño (si no se encuentra, pon null),
          angulo: ángulo (si no se encuentra, pon null),
          presion: presión (si no se encuentra, pon null),
          tipo_inicial: (extrae la inicial del tipo de producto si no viene NULL: 
              {
    T: ["TUBO", "TBA", "TB", "TUBO MECANICO"],
    B: ["BRIDA", "BRID", "B", "BRIDAS", "BRIDA HDPE"],
    C: ["CODO", "C.DO", "COD", "CODO90"],
    CO: ["CONECTOR", "CON", "CDO", "CONECT"],
    CP: ["COPLE", "CPL", "COP", "COPLE HDPE", "COPLE VIC"],
    CZ: ["CRUZ", "CRZ", "CROSS"],
    FI: ["FILTRO", "FIL", "FI", "FILTRO Y", "FILTRACION"],
    INR: ["INSERTO REDUCIDO", "INR", "INSERT RED", "REDUCIDO"],
    MRA: ["MAQUINA RANURADORA", "MRA", "RANURADORA", "MÁQUINA"],
    MC: ["MEDIO COPLE", "MC", "COPLE MEDIO", "MCO"],
    NI: ["NIPLE", "NI", "NPL", "NIPLE ACERO", "NIPLE HDPE"],
    RB: ["REDUCCION BUSHING", "RED BUSHING", "RB", "BUSHING"],
    RCA: ["REDUCCION CAMPANA", "RC", "RCA", "REDUC CAMPANA"],
    RC: ["REDUCCION CONCENTRICA", "REDUCCION", "RC", "RED CONCENTRICA"],
    RE: ["REDUC EXCENTRICA", "REDUCION EXC", "RC", "REDUC EXC"],
    RPE: ["ROCIADOR PENDIENTE", "RPE", "ROCIADOR"],
    TEM: ["TEE MECANICA", "TEM", "TEE VICTAULIC"],
    SK: ["SOCKOLET", "SK", "SOCKET"],
    TP: ["TAPA", "TAPON", "TP", "CUBIERTA"],
    TAC: ["TAPA CAPA", "TAC", "CUBIERTA CAPA"],
    TAM: ["TAPON MACHO", "TAM", "TAPON"],
    TE: ["TEE", "T", "TEE MECANICA"],
    TEHDP: ["TEE HDPE", "TEHDP", "TEE HDPE", "TEE HDPE VIC"],
    TER: ["TEE REDUCIDA", "TER", "TEE RED", "TEE REDUC"],
    TH: ["THREDOLET", "TH", "THREDOLET VICTAULIC"],
    TU: ["TUERCA UNION", "TU", "UNION TUERCA"],
    GU: ["GUARDA", "GU", "GUARDIA"],
    JE: ["JUNTA EXPANSION", "JE", "JUNTA"],
    JF: ["JUNTA FLEXIBLE", "JF", "FLEXIBLE"],
    MA: ["MANGUERA", "MA", "MANG", "MANGUERA VICTAULIC"],
    ST: ["STUB", "ST", "STUB END"],
    STHD: ["STUB END HDPE", "STHD", "STUB HDPE"],
    SW: ["SWAGE", "SW", "CONCENTRICO", "SWAGE CONC"],
    SWC: ["SWAGE CONCENTRICO", "SWC", "CONCENTRICO"],
    WE: ["WELDOLET", "WE", "WELD"],
    BAH: ["BARRA HUECA", "BAH", "BARRA HUECA CALIENTE"],
    BHC: ["BARRA HUECA CALIENTE", "BHC", "BARRA HUECA CAL"],
    THDP: ["TUBO HDPE", "THDP", "TUBO HDPE", "HDPE TUBO"],
    TME: ["TUBO MECANICO", "TME", "MECANICO"],
    TRIM: ["TRIM", "TRIM", "ADECUAL"],
    V: ["VALVULA", "V", "VAL", "VALVULA GLOBO"],
    VB: ["VALVULA BOLA", "VB", "VALVULA BOLA", "VALVULA BOLA"],
    VC: ["VALVULA COMPUERTA", "VC", "VALVULA COMP", "VALV COMPUERTA"],
    VMA: ["VALVULA MARIPOSA", "VMA", "VALV MARIPOSA"],
    VCH: ["VALVULA CHECK", "VCH", "CHECK VALVE"],
    VBA: ["VALVULA BALANCEO", "VBA", "BALANCEO VALVE"],
    VCU: ["VALVULA CUCHILLA", "VCU", "CUCHILLA VALVE"],
    VAL: ["VALVULA ALARMA", "VAL", "ALARMA VALVE"],
    VD: ["VALVULA DUO", "VD", "DUO VALVE"],
    VE: ["VALVULA ELIMINADORA", "VE", "VALV ELIMINADOR"],
    VG: ["VALVULA GLOBO", "VG", "GLOBO VALVE"],
    VM: ["VALVULA MACHO", "VM", "MACHO VALVE"],
    VP: ["VALVULA PIE", "VP", "PIE VALVE"]
}),
          product_variants: {
              T: ["TUBO", "TBA", "TB", "TUBO MECANICO"],
              B: ["BRIDA", "BRID", "B", "BRIDAS", "BRIDA HDPE"],
              C: ["CODO", "C.DO", "COD", "CODO90"],
              CO: ["CONECTOR", "CON", "CDO", "CONECT"],
              CP: ["COPLE", "CPL", "COP", "COPLE HDPE", "COPLE VIC"],
              CZ: ["CRUZ", "CRZ", "CROSS"],
              FI: ["FILTRO", "FIL", "FI", "FILTRO Y", "FILTRACION"],
              INR: ["INSERTO REDUCIDO", "INR", "INSERT RED", "REDUCIDO"],
              MRA: ["MAQUINA RANURADORA", "MRA", "RANURADORA", "MÁQUINA"],
              MC: ["MEDIO COPLE", "MC", "COPLE MEDIO", "MCO"],
              NI: ["NIPLE", "NI", "NPL", "NIPLE ACERO", "NIPLE HDPE"],
              RB: ["REDUCCION BUSHING", "RED BUSHING", "RB", "BUSHING"],
              RCA: ["REDUCCION CAMPANA", "RC", "RCA", "REDUC CAMPANA"],
              RC: ["REDUCCION CONCENTRICA", "REDUCCION", "RC", "RED CONCENTRICA"],
              RE: ["REDUC EXCENTRICA", "REDUCION EXC", "RC", "REDUC EXC"],
              RPE: ["ROCIADOR PENDIENTE", "RPE", "ROCIADOR"],
              TEM: ["TEE MECANICA", "TEM", "TEE VICTAULIC"],
              SK: ["SOCKOLET", "SK", "SOCKET"],
              TP: ["TAPA", "TAPON", "TP", "CUBIERTA"],
              TAC: ["TAPA CAPA", "TAC", "CUBIERTA CAPA"],
              TAM: ["TAPON MACHO", "TAM", "TAPON"],
              TE: ["TEE", "T", "TEE MECANICA"],
              TEHDP: ["TEE HDPE", "TEHDP", "TEE HDPE", "TEE HDPE VIC"],
              TER: ["TEE REDUCIDA", "TER", "TEE RED", "TEE REDUC"],
              TH: ["THREDOLET", "TH", "THREDOLET VICTAULIC"],
              TU: ["TUERCA UNION", "TU", "UNION TUERCA"],
              GU: ["GUARDA", "GU", "GUARDIA"],
              JE: ["JUNTA EXPANSION", "JE", "JUNTA"],
              JF: ["JUNTA FLEXIBLE", "JF", "FLEXIBLE"],
              MA: ["MANGUERA", "MA", "MANG", "MANGUERA VICTAULIC"],
              ST: ["STUB", "ST", "STUB END"],
              STHD: ["STUB END HDPE", "STHD", "STUB HDPE"],
              SW: ["SWAGE", "SW", "CONCENTRICO", "SWAGE CONC"],
              SWC: ["SWAGE CONCENTRICO", "SWC", "CONCENTRICO"],
              WE: ["WELDOLET", "WE", "WELD"],
              BAH: ["BARRA HUECA", "BAH", "BARRA HUECA CALIENTE"],
              BHC: ["BARRA HUECA CALIENTE", "BHC", "BARRA HUECA CAL"],
              THDP: ["TUBO HDPE", "THDP", "TUBO HDPE", "HDPE TUBO"],
              TME: ["TUBO MECANICO", "TME", "MECANICO"],
              TRIM: ["TRIM", "TRIM", "ADECUAL"],
              V: ["VALVULA", "V", "VAL", "VALVULA GLOBO"],
              VB: ["VALVULA BOLA", "VB", "VALVULA BOLA", "VALVULA BOLA"],
              VC: ["VALVULA COMPUERTA", "VC", "VALVULA COMP", "VALV COMPUERTA"],
              VMA: ["VALVULA MARIPOSA", "VMA", "VALV MARIPOSA"],
              VCH: ["VALVULA CHECK", "VCH", "CHECK VALVE"],
              VBA: ["VALVULA BALANCEO", "VBA", "BALANCEO VALVE"],
              VCU: ["VALVULA CUCHILLA", "VCU", "CUCHILLA VALVE"],
              VAL: ["VALVULA ALARMA", "VAL", "ALARMA VALVE"],
              VD: ["VALVULA DUO", "VD", "DUO VALVE"],
              VE: ["VALVULA ELIMINADORA", "VE", "VALV ELIMINADOR"],
              VG: ["VALVULA GLOBO", "VG", "GLOBO VALVE"],
              VM: ["VALVULA MACHO", "VM", "MACHO VALVE"],
              VP: ["VALVULA PIE", "VP", "PIE VALVE"]
          }
        }


`;

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Eres un asistente que ayuda a extraer datos clave de descripciones de productos industriales como tubos, codos, tees, y reducciones.',
      },
      {
        role: 'user',
        content: content2,
      },
    ],
    temperature: 0.2,
  });

  // Procesar la respuesta para obtener la información clave
  let extractedInfo = resp.choices[0].message.content as any;

  console.log(extractedInfo);

  if (
    extractedInfo.startsWith('```json\n') &&
    extractedInfo.endsWith('\n```')
  ) {
    extractedInfo = extractedInfo
      .replace(/```json\n/, '') // Elimina el inicio ```json
      .replace(/\n```$/, ''); // Elimina el final ```
  }

  const extractedInfoToJson = JSON.parse(extractedInfo);

  const cedula = extractedInfoToJson.ced
    ? `CED ${extractedInfoToJson.ced}`
    : '';

  const diameter = extractedInfoToJson.diameter ?? '';

  const descriptiongenerate = `${diameter} ${cedula}`;

  return { ...extractedInfoToJson, toSearch: descriptiongenerate };
};
