import * as core from '@actions/core';
import * as httpm from '@actions/http-client';
import * as auth from '@actions/http-client/lib/auth';

// TODO: set to prod url
const url = 'https://neelix.jp.ngrok.io/v1.0/experience';

const DEFAULT_COMMENTARY = 'Default commentary';
const DEFAULT_WEIGHT = 0;


type ExperienceData = {
  consortium_id: string;
  commentary: string;
}


const createExperience = async (apiToken: string, data: ExperienceData) => {
  const rh = new auth.BearerCredentialHandler(apiToken);

  // TODO: update user agent name
  const http = new httpm.HttpClient('generic-action-gha', [rh]);

  const res = await http.postJson(url, data);
  console.log('success response from Neelix:');
  console.log('status:', res.statusCode);
  console.log('body:', res.result);
}

const run = async () => {
  try {
    const apiToken = core.getInput('api-token');
    const consortiumId = core.getInput('consortium-id');
    const commentary = core.getInput('commentary');
    const weight = +core.getInput('weight');

    const data = {
      consortium_id: consortiumId,
      commentary: commentary || DEFAULT_COMMENTARY,
      weight: weight || DEFAULT_WEIGHT,
    };

    await createExperience(apiToken, data);

  } catch (err) {
    let error: string | Error = 'Unknown error';
    if (typeof err === 'string') {
      error = err;
    } else if (err instanceof Error) {
      error = err;
    } else if (err && typeof err === 'object' && 'message' in err) {
      error = JSON.stringify(err.message);
    }
    core.setFailed(error);
  }
}

run();
