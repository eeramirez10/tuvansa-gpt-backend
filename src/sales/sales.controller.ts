import { Body, Controller, Post } from '@nestjs/common';
import { SalesService } from './sales.service';
import { AnalyzeDescriptionDto } from './dtos/analyze-description-dto';
import { removeLastLetterIfNumber } from 'src/common/utils/removeLastLetterIfNumber';

// const INICIALES_PRODUCTOS = {
//   T: 'TUBO',
//   B: 'BRIDA',
//   C: 'CODO',
//   CO: 'CONECTOR',
//   CP: 'COPLE',
//   CZ: 'CRUZ',
//   FI: 'FILTRO',
//   INR: 'INSERTO REDUCIDO',
//   MRA: 'MAQUINA RANURADORA',
//   MC: 'MEDIO COPLE',
//   NI: 'NIPLE',
//   RB: 'REDUCCION O RED BUSHING',
//   RCA: 'REDUCCION CAMPANA',
//   RC: 'REDUCCION CONCENTRICA',
//   RE: 'REDUCCION EXCENTRICA',
//   RPE: 'ROCIADOR PENDIENTE',
//   TEM: 'TEE MECANICA',
//   SK: 'SOCKOLET',
//   TP: 'TAPA O TAPON',
//   TAC: 'TAPA O TAPON CAPA',
//   TAM: 'TAPON MACHO',
//   TE: 'TEE',
//   TEHDP: 'TEE RECTA HDPE',
//   TER: 'TEE RED O TEE REDUCIDA',
//   TH: 'THREDOLET',
//   TU: 'TUERCA UNION',
//   GU: 'GUARDA',
//   JE: 'JUNTA DE EXPANSION',
//   JF: 'JUNTA FLEXIBLE',
//   MA: 'MANGUERA',
//   ST: 'STUB',
//   STHD: 'STUB END HDPE',
//   SW: 'SWAGE',
//   SWC: 'SWAGE CONCENTRICO',
//   WE: 'WELDOLET',
//   BAH: 'BARRA HUECA',
//   BHC: 'BARRA HUECA EN CALIENTE',
//   THDP: 'TUBO DE HDPE',
//   TME: 'TUBO MECANICO',
//   TRIM: 'TRIM',
//   V: 'VALVULA',
//   VB: 'VALVULA BOLA',
//   VC: 'VALVULA COMPUERTA',
//   VMA: 'VALVULA MARIPOSA',
//   VCH: 'VALVULA CHECK',
//   VBA: 'VALVULA BALANCEO',
//   VCU: 'VALVULA CUCHILLA',
//   VAL: 'VALVULA ALARMA',
//   VD: 'VALVULA DUO',
//   VE: 'VALVULA ELIMINADORA',
//   VG: 'VALVULA GLOBO',
//   VM: 'VALVULA MACHO',
//   VPIE: 'VALVULA P',
// };

const PRODUCTOS_INICIALES = {
  TUBO: 'T',
  BRIDA: 'B',
  CODO: 'C',
  CONECTOR: 'CO',
  COPLE: 'CP',
  'COPLE REDUCIDO': 'CPR',
  'COPLE RIGIDO': 'CP',
  CRUZ: 'CZ',
  FILTRO: 'FI',
  'INSERTO REDUCIDO': 'INR',
  'MAQUINA RANURADORA': 'MRA',
  'MEDIO COPLE': 'MC',
  NIPLE: 'NI',
  REDUCCION: 'RB',
  'REDUCCION BUSHING': 'RB',
  'REDUCCION CAMPANA': 'RCA',
  'REDUCCION CONCENTRICA': 'RC',
  'REDUCCION EXCENTRICA': 'RE',
  'ROCIADOR PENDIENTE': 'RPE',
  SOCKOLET: 'SK',
  'TAPA O TAPON': 'TP',
  'TAPA O TAPON CAPA': 'TAC',
  'TAPON MACHO': 'TAM',
  TEE: 'TE',
  'TEE MECANICA': 'TEME',
  'TEE RECTA HDPE': 'TEHDP',
  'TEE REDUCIDA': 'TER',
  THREDOLET: 'TH',
  'TUERCA UNION': 'TUU',
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
  'VALVULA AGUJA': 'VAG',
  'VALVULA COMPUERTA': 'VC',
  'VALVULA MARIPOSA': 'VMA',
  'VALVULA CHECK': 'VCH',
  'VALVULA BALANCEO': 'VBA',
  'VALVULA CUCHILLA': 'VCU',
  'VALVULA ALARMA': 'VAL',
  'VALVULA DUO': 'VD',
  'VALVULA ELIMINADORA': 'VE',
  'VALVULA GLOBO': 'VGL',
  'VALVULA MACHO': 'VM',
  'VALVULA P': 'VPIE',
};

const CEDULAS = {
  80: 'XS',
  40: 'STD',
  STD: 'SW',
};

const MATERIALS = {
  PVC: 'PVC',
  PPR: 'PPR',
  'HIERRO MALEABLE': 'HM',
};

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  //  @Post('/quotes/analyze-quote-file')
  //  analyzeQuoteFile(){

  //  }

  @Post('/quotes/analyze-description')
  async analyzeDescription(
    @Body() analyzeDescriptionDto: AnalyzeDescriptionDto,
  ) {
    const resp = await this.salesService.analyzeDescription(
      analyzeDescriptionDto,
    );

    const {
      estandar,
      ranurado,
      galvanizado,
      diameter,
      diameter2,
      costura,
      ced,
      roscado,
      liso,
      tramos,
      negro,
      peso,
      material_especifico,
      tamaño,
      angulo,
      product,
      figura,
      presion,
      tipo_inicial,
      material,
      radio_largo,
      radio_corto,
      nomenclatura,
      pesado,
    } = resp;

    if (!PRODUCTOS_INICIALES[product])
      return 'No existe el producto en el catalogo';

    const inicial_material = PRODUCTOS_INICIALES[product];
    const diametro = diameter?.replace(/["]/g, '').replace(/-/g, '') ?? '';
    const fig = figura ? removeLastLetterIfNumber(figura) : '';

    let generatedEan;

    if (PRODUCTOS_INICIALES[product] === PRODUCTOS_INICIALES.TUBO) {
      const hasMaterial = material !== null ? MATERIALS[material] : '';

      generatedEan = `
      ${inicial_material ?? ''}
      ${costura ?? ''}
      ${diametro}
      ${ced ?? ''}
      ${nomenclatura ?? ''}
      ${negro ?? ''}
      ${ranurado ?? ''}
      ${galvanizado ?? ''}
      ${liso ?? ''}
      ${roscado ?? ''}
      ${hasMaterial ?? ''}
    `;

      //     generatedEan = `
      //   ${inicial_material ?? ''}
      //   ${costura ?? ''}
      //   ${diametro}
      //   ${ced ?? ''}
      //   ${nomenclatura ?? ''}
      //   ${negro ?? ''}
      //   ${ranurado ?? ''}
      //   ${galvanizado ?? ''}
      //   ${liso ?? ''}
      //   ${roscado ?? ''}
      //   ${hasMaterial ?? ''}
      //   ${tramos ?? ''}
      // `;
    }

    if (PRODUCTOS_INICIALES[product].includes(PRODUCTOS_INICIALES.VALVULA)) {
      console.log({ diametro });
      const hasFig = fig?.replace('.', '') ?? presion;
      generatedEan = `
      ${PRODUCTOS_INICIALES[product] ?? ''}
      ${diametro}
      ${hasFig ?? ''}
      ${negro ?? ''}
      ${ranurado ?? ''}
      ${galvanizado ?? ''}
      ${liso ?? ''}
      ${roscado ?? ''}

    `;
    }

    // // Para codos Acero Soldar el ean queda de la siguiente manera = Inicial Producto/SW?/diametro/Grados/Radio Largo || Radio Corto / cedula
    if (PRODUCTOS_INICIALES[product] === PRODUCTOS_INICIALES.CODO) {
      const hasAngulo = angulo ? `${angulo}O` : '';

      generatedEan = `
      ${inicial_material}
      ${estandar ?? ''}
      ${diametro}
      ${hasAngulo}
      ${radio_largo ?? ''}
      ${radio_corto ?? ''}
      ${galvanizado ?? ''}
      ${ced ?? ''}
    `;
    }

    if (PRODUCTOS_INICIALES[product] === PRODUCTOS_INICIALES.COPLE) {
      const hasMaterial =
        material !== null ? (material === 'PVC' ? `T${material}` : '') : '';

      generatedEan = `
      ${inicial_material}
      ${diametro}
      ${ced ?? ''}
      ${fig ?? ''}
      ${radio_largo ?? ''}
      ${radio_corto ?? ''}
      ${galvanizado ?? ''}
      ${hasMaterial}
      ${pesado ?? ''}
      
    `;
    }

    if (PRODUCTOS_INICIALES[product].includes(PRODUCTOS_INICIALES.TEE)) {
      const hasMaterial =
        material !== null ? (material === 'PVC' ? `T${material}` : '') : '';

      generatedEan = `
      ${inicial_material}
      ${roscado ?? ''}
      ${diametro}
    
      ${fig ?? ''}
      ${ced ?? ''}
      ${estandar ?? ''}
      ${presion ?? ''}
      ${galvanizado ? galvanizado : (MATERIALS[material] ?? '')}
      

      
    `;
    }

    if (PRODUCTOS_INICIALES[product].includes(PRODUCTOS_INICIALES.SWAGE)) {
      const diametro2 = diameter2.replace(/["]/g, '') ?? '';
      const hasMaterial =
        material !== null ? (material === 'PVC' ? `T${material}` : '') : '';

      generatedEan = `
      ${inicial_material}
      ${roscado ?? ''}
      ${diametro}
      ${diameter2 !== null ? `X${diametro2}` : ''}
      ${fig ?? ''}
      ${ced ?? ''}
      ${estandar ?? ''}
      ${presion ?? ''}
      ${galvanizado ? galvanizado : (MATERIALS[material] ?? '')}
      

      
    `;
    }

    if (PRODUCTOS_INICIALES[product].includes(PRODUCTOS_INICIALES.WELDOLET)) {
      const diametro2 = diameter2.replace(/["]/g, '');
      const hasMaterial =
        material !== null ? (material === 'PVC' ? `T${material}` : '') : '';

      generatedEan = `
      ${inicial_material}
      ${roscado ?? ''}
      ${diametro}
      ${diameter2 !== null ? `X${diametro2}` : ''}
      ${fig ?? ''}
      ${CEDULAS[ced] ?? ''}
      ${estandar ?? ''}
      ${presion ?? ''}
      ${galvanizado ? galvanizado : (MATERIALS[material] ?? '')}
      

      
    `;
    }

    if (PRODUCTOS_INICIALES[product].includes(PRODUCTOS_INICIALES.THREDOLET)) {
      const diametro2 = diameter2.replace(/["]/g, '');
      const hasMaterial =
        material !== null ? (material === 'PVC' ? `T${material}` : '') : '';

      generatedEan = `
      ${inicial_material}
      ${roscado ?? ''}
      ${diametro}
      ${diameter2 !== null ? `X${diametro2}` : ''}
      ${fig ?? ''}
      ${CEDULAS[ced] ?? ''}
      ${estandar ?? ''}
      ${presion ?? ''}
      ${galvanizado ? galvanizado : (MATERIALS[material] ?? '')}
      

      
    `;
    }

    if (
      PRODUCTOS_INICIALES[product].includes(PRODUCTOS_INICIALES['TUERCA UNION'])
    ) {
      const diametro2 = diameter2 ? diameter2.replace(/["]/g, '') : '';
      const hasMaterial =
        material !== null ? (material === 'PVC' ? `T${material}` : '') : '';

      generatedEan = `
      ${inicial_material}
      ${roscado ?? ''}
      ${diametro}
      ${diameter2 !== null ? `X${diametro2}` : ''}
      ${fig ?? ''}
      ${CEDULAS[ced] ?? ''}
      ${estandar ?? ''}
      ${presion ?? ''}
      ${ranurado ?? ''}
      ${roscado ?? ''}
      ${galvanizado ? galvanizado : (MATERIALS[material] ?? '')}
      

      
    `;
    }

    if (PRODUCTOS_INICIALES[product].includes(PRODUCTOS_INICIALES.REDUCCION)) {
      const diametro2 = diameter2 ? diameter2.replace(/["]/g, '') : '';

      generatedEan = `
      ${inicial_material}
      ${diametro}
      ${diameter2 !== null ? `X${diametro2}` : ''}
      ${fig ?? ''}
      ${CEDULAS[ced] ?? ''}
      ${estandar ?? ''}
      ${presion ?? ''}
      ${ranurado ?? ''}
      ${roscado ?? ''}
      ${galvanizado ? galvanizado : (MATERIALS[material] ?? '')}
      

      
    `;
    }

    // generatedEan.replace(/\s+/g, '').trim()

    return { ...resp, ean: generatedEan?.replace(/\s+/g, '').trim() };
  }
}
