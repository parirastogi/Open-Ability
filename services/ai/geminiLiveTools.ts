export const GEMINI_LIVE_TOOLS = [
  {
    function_declarations: [
      {
        name: 'submitVoiceModeDecision',
        description: 'Record user decision on whether to use OpenAbility with voice mode.',
        parameters: {
          type: 'OBJECT',
          properties: {
            answer: { type: 'STRING', enum: ['yes', 'no'] }
          },
          required: ['answer']
        }
      },
      {
        name: 'submitLanguageDecision',
        description: 'Record user language selection for OpenAbility.',
        parameters: {
          type: 'OBJECT',
          properties: {
            lang: { type: 'STRING', enum: ['en-IN', 'hi-IN'] }
          },
          required: ['lang']
        }
      },
      {
        name: 'submitAuthChoice',
        description: 'Record user selection for Login or Sign Up.',
        parameters: {
          type: 'OBJECT',
          properties: {
            choice: { type: 'STRING', enum: ['LOGIN', 'SIGNUP'] }
          },
          required: ['choice']
        }
      },
      {
        name: 'triggerGlobalControl',
        description: 'Trigger global voice controls such as STOP, REPEAT, CANCEL, GO_BACK, or HELP.',
        parameters: {
          type: 'OBJECT',
          properties: {
            control: { type: 'STRING', enum: ['STOP', 'REPEAT', 'CANCEL', 'GO_BACK', 'HELP'] }
          },
          required: ['control']
        }
      }
    ]
  }
];
