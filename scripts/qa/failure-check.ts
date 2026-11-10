import {visualCases} from '../../tests/visual/cases.ts';
import {captureCases} from './visual.ts';
import {assertExpectedFailure, ExpectedFailureMismatch} from './expected-failure.ts';
import type {NegativeCase} from './expected-failure.ts';

export function negativeCases(): NegativeCase[] {
  const source = visualCases.find((c) => c.compositionId === 'ReliabilityFixture' && c.frame === 90);
  if (!source) throw new Error('Required settled reliability case is not registered in the QA matrix.');
  return [
    {case: {...source, id: 'missing-composition', compositionId: 'NotRegistered'},
      expectation: {kind: 'missing-composition', missingId: 'NotRegistered', availableId: source.compositionId}},
    {case: {...source, id: 'invalid-props', props: {...source.props, fixture: 'not-a-fixture'}},
      expectation: {kind: 'invalid-props', validator: 'reliability-fixture'}},
    {case: {...source, id: 'critical-layout', props: {...source.props, fixture: 'overflow'}},
      expectation: {kind: 'critical-layout', elementId: 'qa-title', allowedElementIds: ['qa-title', 'qa-subtitle'], requiredCodes: ['TEXT_OVERFLOW', 'TEXT_CLIPPED'],
        allowedCodes: ['TEXT_OVERFLOW', 'TEXT_CLIPPED', 'TEXT_UNEXPECTED_WRAP']}},
  ];
}

export async function failureCheck(run: string, capture: typeof captureCases = captureCases): Promise<void> {
  for (const definition of negativeCases()) {
    let result;
    try {result = await capture([definition.case], `${run}-${definition.case.id}`);}
    catch (error) {throw new ExpectedFailureMismatch(definition, 'Capture threw before returning the required failed-case evidence.', error);}
    assertExpectedFailure(result, definition);
    console.log(`PASS — expected rejection ${definition.case.id} (${definition.expectation.kind}): ${result.error?.message}`);
  }
}
