import { describe, it, expect } from 'vitest';
import {
  calculateReconstitution,
  calculatePharmacokinetics,
  COMPOUND_PRESETS,
  SYRINGE_CAPACITY,
  INPUT_LIMITS,
  getRecommendedWaterMl,
} from './calculator';

// ---------------------------------------------------------------------------
// calculateReconstitution
// ---------------------------------------------------------------------------

describe('calculateReconstitution — 基础计算', () => {
  it('5mg 西林瓶 + 2mL BAC 水 + 250mcg 剂量（U-100）', () => {
    const r = calculateReconstitution(5, 2, 250, 'U100');
    expect(r.error).toBeNull();
    expect(r.concentrationMgMl).toBe(2.5);
    expect(r.concentrationMcgMl).toBe(2500);
    expect(r.drawVolumeMl).toBe(0.1);
    expect(r.syringeUnits).toBe(10);
    expect(r.totalVialDoses).toBe(20);
    expect(r.overCapacity).toBe(false);
    expect(r.syringesRequired).toBe(1);
    expect(r.syringeCapacity).toBe(SYRINGE_CAPACITY.U100);
  });

  it('同样输入在 U-40 下换算为 40 单位/mL', () => {
    const r = calculateReconstitution(5, 2, 250, 'U40');
    expect(r.error).toBeNull();
    expect(r.syringeUnits).toBe(4); // 0.1mL * 40
    expect(r.syringeCapacity).toBe(SYRINGE_CAPACITY.U40);
  });

  it('10mg 西林瓶 + 2mL 水 + 2.5mg 剂量 → 50 单位', () => {
    const r = calculateReconstitution(10, 2, 2500, 'U100');
    expect(r.error).toBeNull();
    expect(r.syringeUnits).toBe(50);
    expect(r.totalVialDoses).toBe(4);
  });

  it('vialCost 传入时计算单次剂量成本', () => {
    const r = calculateReconstitution(10, 2, 2500, 'U100', 40);
    // 10mg 瓶 4 次用完，$40 / 4 = $10
    expect(r.costPerDose).toBe(10);
  });

  it('vialCost 缺省时 costPerDose 为 undefined', () => {
    const r = calculateReconstitution(10, 2, 2500, 'U100');
    expect(r.costPerDose).toBeUndefined();
  });

  it('Cagrilintide 5mg 瓶 + 2mL 水 + 250mcg 初始剂量 → 10 单位 (0.1mL)', () => {
    const r = calculateReconstitution(5, 2, 250, 'U100');
    expect(r.error).toBeNull();
    expect(r.concentrationMgMl).toBe(2.5);
    expect(r.drawVolumeMl).toBe(0.1);
    expect(r.syringeUnits).toBe(10);
    expect(r.totalVialDoses).toBe(20);
  });

  it('Ipamorelin 5mg 瓶 + 2mL 水 + 200mcg 睡前剂量 → 8 单位 (0.08mL)', () => {
    const r = calculateReconstitution(5, 2, 200, 'U100');
    expect(r.error).toBeNull();
    expect(r.concentrationMgMl).toBe(2.5);
    expect(r.drawVolumeMl).toBe(0.08);
    expect(r.syringeUnits).toBe(8);
    expect(r.totalVialDoses).toBe(25);
  });
});

describe('calculateReconstitution — 输入合法性拦截', () => {
  it.each([
    ['0（下界之外）', 0],
    ['0.05（低于 0.1）', 0.05],
    ['100.1（高于 100）', 100.1],
    ['NaN', NaN],
    ['Infinity', Infinity],
  ])('vialMg = %s → INVALID_VIAL', (_label, vialMg) => {
    const r = calculateReconstitution(vialMg, 2, 250, 'U100');
    expect(r.error).toBe('INVALID_VIAL');
    expect(r.syringeUnits).toBe(0);
  });

  it.each([
    ['0（下界之外）', 0],
    ['10.1（高于 10）', 10.1],
    ['NaN', NaN],
    ['Infinity', Infinity],
  ])('waterMl = %s → INVALID_WATER', (_label, waterMl) => {
    const r = calculateReconstitution(5, waterMl, 250, 'U100');
    expect(r.error).toBe('INVALID_WATER');
  });

  it.each([
    ['0（下界之外）', 0],
    ['50001（高于 50000）', 50001],
    ['NaN', NaN],
  ])('targetDoseMcg = %s → INVALID_DOSE', (_label, dose) => {
    const r = calculateReconstitution(5, 2, dose, 'U100');
    expect(r.error).toBe('INVALID_DOSE');
  });

  it('单次剂量超过整瓶粉末 → DOSE_EXCEEDS_VIAL（物理不可能）', () => {
    // 0.1mg 瓶最多 100mcg
    const r = calculateReconstitution(0.1, 2, 150, 'U100');
    expect(r.error).toBe('DOSE_EXCEEDS_VIAL');
  });

  it('输入边界值恰好合法（0.1 / 0.1 / 1）', () => {
    const r = calculateReconstitution(0.1, 0.1, 1, 'U100');
    expect(r.error).toBeNull();
    expect(r.concentrationMgMl).toBe(1);
  });
});

describe('calculateReconstitution — 针管容量防护', () => {
  it('抽取量超过 U-100 单支容量 → overCapacity + 多支针管数', () => {
    // 0.1mg 瓶 + 10mL 水 → 0.01mg/mL；50mcg → 需抽 5mL = 500 单位
    const r = calculateReconstitution(0.1, 10, 50, 'U100');
    expect(r.error).toBeNull();
    expect(r.drawVolumeMl).toBe(5);
    expect(r.overCapacity).toBe(true);
    expect(r.syringesRequired).toBe(5);
  });

  it('抽取量恰好等于容量（100 单位）不算超量', () => {
    // 100mg 瓶 + 10mL 水 → 10mg/mL；10000mcg → 1mL → 100 units
    const r = calculateReconstitution(100, 10, 10000, 'U100');
    expect(r.error).toBeNull();
    expect(r.syringeUnits).toBe(100);
    expect(r.overCapacity).toBe(false);
    expect(r.syringesRequired).toBe(1);
  });

  it('U-40 容量为 40 单位', () => {
    expect(SYRINGE_CAPACITY.U100).toBe(100);
    expect(SYRINGE_CAPACITY.U40).toBe(40);
    expect(INPUT_LIMITS.vialMg).toEqual({ min: 0.1, max: 100 });
    expect(INPUT_LIMITS.waterMl).toEqual({ min: 0.1, max: 10 });
    expect(INPUT_LIMITS.targetDoseMcg).toEqual({ min: 1, max: 50000 });
  });
});

describe('calculateReconstitution — 预设数据完整性', () => {
  it('所有预设的默认剂量都不超过其默认瓶含量', () => {
    for (const p of COMPOUND_PRESETS) {
      const r = calculateReconstitution(p.defaultVialMg, p.defaultWaterMl, p.defaultDoseMcg, 'U100');
      expect(r.error, `预设 ${p.id} 的默认参数应可计算`).toBeNull();
    }
  });

  it('所有预设均包含规范的药理机制分类标签 (drugClass)', () => {
    for (const p of COMPOUND_PRESETS) {
      expect(p.drugClass, `${p.id} 应有分类标签`).toBeDefined();
      expect(p.drugClass!.length).toBeGreaterThan(0);
    }
    const sema = COMPOUND_PRESETS.find((p) => p.id === 'semaglutide');
    const tirz = COMPOUND_PRESETS.find((p) => p.id === 'tirzepatide');
    const reta = COMPOUND_PRESETS.find((p) => p.id === 'retatrutide');
    expect(sema?.drugClass).toBe('GLP-1 RA');
    expect(tirz?.drugClass).toBe('Dual GIP/GLP-1');
    expect(reta?.drugClass).toBe('Triple G (GLP/GIP/GCG)');
  });
});

// ---------------------------------------------------------------------------
// calculatePharmacokinetics
// ---------------------------------------------------------------------------

describe('calculatePharmacokinetics — 退化输入', () => {
  it('无注射记录 → 全零', () => {
    const r = calculatePharmacokinetics([], 168, 28, 6);
    expect(r.dataPoints).toHaveLength(0);
    expect(r.peakConcentration).toBe(0);
    expect(r.troughConcentration).toBe(0);
    expect(r.averageConcentration).toBe(0);
  });

  it('半衰期非正数 / NaN → 全零', () => {
    for (const bad of [0, -24, NaN, Infinity]) {
      const r = calculatePharmacokinetics(
        [{ id: '1', compoundId: 'semaglutide', day: 0, doseMg: 0.25 }],
        bad,
        28,
        6
      );
      expect(r.dataPoints, `halfLife=${bad}`).toHaveLength(0);
    }
  });

  it('总天数非正数 → 全零', () => {
    const r = calculatePharmacokinetics(
      [{ id: '1', compoundId: 'semaglutide', day: 0, doseMg: 0.25 }],
      168,
      0,
      6
    );
    expect(r.dataPoints).toHaveLength(0);
  });
});

describe('calculatePharmacokinetics — 单次注射衰减', () => {
  const inj = [{ id: '1', compoundId: 'x', day: 0, doseMg: 1 }];

  it('Bateman 皮下吸收模型：t=0 为 0，随后达到吸收峰值并按半衰期衰减', () => {
    const r = calculatePharmacokinetics(inj, 24, 3, 24);
    const conc = r.dataPoints.map((p) => p.concentration);
    expect(conc[0]).toBe(0);
    expect(conc[1]).toBeGreaterThan(conc[2]);
    expect(conc[2]).toBeGreaterThan(conc[3]);
  });

  it('h=0 处标记为注射点', () => {
    const r = calculatePharmacokinetics(inj, 24, 3, 24);
    expect(r.dataPoints[0].isInjectionPoint).toBe(true);
    expect(r.dataPoints[1].isInjectionPoint).toBe(false);
  });

  it('peakConcentration 为正数，troughConcentration 统计后期稳态谷值', () => {
    const r = calculatePharmacokinetics(inj, 24, 3, 24);
    expect(r.peakConcentration).toBeGreaterThan(0.5);
    expect(r.troughConcentration).toBeLessThanOrEqual(r.peakConcentration);
    expect(r.averageConcentration).toBeGreaterThan(0);
  });
});

describe('calculatePharmacokinetics — 多次注射叠加', () => {
  it('多次注射产生药物蓄积且峰值浓度上升', () => {
    const singleInj = [{ id: '1', compoundId: 'x', day: 0, doseMg: 1 }];
    const multiInj = [
      { id: '1', compoundId: 'x', day: 0, doseMg: 1 },
      { id: '2', compoundId: 'x', day: 1, doseMg: 1 },
    ];
    const rSingle = calculatePharmacokinetics(singleInj, 24, 3, 6);
    const rMulti = calculatePharmacokinetics(multiInj, 24, 3, 6);
    expect(rMulti.peakConcentration).toBeGreaterThan(rSingle.peakConcentration);
  });

  it('3.5 天分割注射也能被识别为注射点（step=6h）', () => {
    const injections = [
      { id: '1', compoundId: 'x', day: 0, doseMg: 0.25 },
      { id: '2', compoundId: 'x', day: 3.5, doseMg: 0.25 },
    ];
    const r = calculatePharmacokinetics(injections, 168, 7, 6);
    const day35 = r.dataPoints.find((p) => p.hour === 84);
    expect(day35).toBeDefined();
    expect(day35!.isInjectionPoint).toBe(true);
  });
});

describe('calculatePharmacokinetics — 采样密度', () => {
  it('28 天 / 6h 步长 → 113 个采样点（含端点）', () => {
    const r = calculatePharmacokinetics(
      [{ id: '1', compoundId: 'x', day: 0, doseMg: 1 }],
      168,
      28,
      6
    );
    expect(r.dataPoints).toHaveLength((28 * 24) / 6 + 1);
    expect(r.dataPoints[r.dataPoints.length - 1].hour).toBe(28 * 24);
  });
});

describe('getRecommendedWaterMl — 临床智能加水量推荐', () => {
  it('2mg 西林瓶默认推荐 1.0 mL 水，避免抽满筒', () => {
    expect(getRecommendedWaterMl(2)).toBe(1.0);
  });

  it('5mg 和 10mg 西林瓶默认推荐 2.0 mL 水', () => {
    expect(getRecommendedWaterMl(5)).toBe(2.0);
    expect(getRecommendedWaterMl(10)).toBe(2.0);
  });

  it('15mg 大规格西林瓶默认推荐 3.0 mL 水', () => {
    expect(getRecommendedWaterMl(15)).toBe(3.0);
  });

  it('2mg 瓶打 1000mcg (1mg) 时，动态推荐 1.0 mL 水达到 50 单位舒适体积', () => {
    expect(getRecommendedWaterMl(2, 1000)).toBe(1.0);
  });

  it('5mg 瓶打 2500mcg (2.5mg) 时，动态推荐 1.0 mL 水达到 50 单位舒适体积', () => {
    expect(getRecommendedWaterMl(5, 2500)).toBe(1.0);
  });
});
