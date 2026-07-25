/// <reference types="jest" />
import { useIncidentStore } from '../incident';

// Simple unit tests validating client-side AI heuristics
describe('Incident Store - AI Simulation', () => {
  it('should classify fire keywords as Fire category and High urgency', async () => {
    const store = useIncidentStore.getState();
    const result = await store.simulateAICategorization('There is a trash fire spreading black smoke');
    
    expect(result.category).toBe('Fire');
    expect(result.urgency).toBe('High');
    expect(result.safety_actions).toContain('Evacuate immediately if you are near the source.');
  });

  it('should classify heart attack/chest pain as Medical category and Critical urgency', async () => {
    const store = useIncidentStore.getState();
    const result = await store.simulateAICategorization('A person collapsed and has stop breathing');
    
    expect(result.category).toBe('Medical');
    expect(result.urgency).toBe('Critical');
  });

  it('should default to Other and Medium for unknown hazards', async () => {
    const store = useIncidentStore.getState();
    const result = await store.simulateAICategorization('Some generic hazard description');
    
    expect(result.category).toBe('Other');
    expect(result.urgency).toBe('Medium');
  });
});
