import * as core from '@actions/core';
import * as httpm from '@actions/http-client';
import * as auth from '@actions/http-client/lib/auth';

// TODO: set to prod url
const API_URL = 'https://neelix.jp.ngrok.io/v1.2';

const DEFAULT_COMMENTARY = 'Default commentary';
const DEFAULT_WEIGHT = 0;


type ExperienceData = {
  consortium_id: string;
  commentary: string;
}


const createExperience = async (
  http: httpm.HttpClient,
  data: ExperienceData,
): Promise<{ id: string } | void> => {
  const url = `${API_URL}/experience`;
  const res = await http.postJson(url, data);
  if (res.statusCode === 201) {
    return <{ id: string }>res.result;
  }

  if (res.statusCode >= 400) {
    throw new Error(`status: ${res.statusCode}; body: ${JSON.stringify(res.result)}`);
  }

  console.log('** UNRECOGNIZED RESULT **');
  console.log('status:', res.statusCode);
  console.log('body:', res.result);
}

const addCategories = async (
  http: httpm.HttpClient,
  experienceId: string,
  categoryIds: string,
) => {
  console.log('addCategories called');
  if (!categoryIds?.length) {
    return;
  }
  const url = `${API_URL}/experience/${experienceId}/categories`;
  const data = categoryIds.split(',');
  const res = await http.putJson(url, data);
  if (res.statusCode >= 400) {
    throw new Error(`status: ${res.statusCode}; body: ${JSON.stringify(res.result)}`);
  }
}

const addTeams = async (
  http: httpm.HttpClient,
  experienceId: string,
  teamIds: string,
) => {
  console.log('addTeams called');
  if (!teamIds?.length) {
    return;
  }
  const url = `${API_URL}/experience/${experienceId}/teams`;
  const data = teamIds.split(',');
  const res = await http.putJson(url, data);
  if (res.statusCode >= 400) {
    throw new Error(`status: ${res.statusCode}; body: ${JSON.stringify(res.result)}`);
  }
}

const run = async () => {
  try {
    const apiToken = core.getInput('api-token');
    const consortiumId = core.getInput('consortium-id');
    const commentary = core.getInput('commentary');
    const weight = +core.getInput('weight');
    const activityId = +core.getInput('activity-id');
    const categoryIds = core.getInput('categoryIds');
    const teamIds = core.getInput('teamIds');

    const rh = new auth.BearerCredentialHandler(apiToken);

    // TODO: update user agent name
    const http = new httpm.HttpClient('generic-action-gha', [rh]);

    const data = {
      consortium_id: consortiumId,
      commentary: commentary || DEFAULT_COMMENTARY,
      weight: weight || DEFAULT_WEIGHT,
      activity_id: activityId || null,
    };

    const result = await createExperience(http, data);
    console.log(`response body: ${result}`);
    console.log(`response body type: ${typeof result}`);
    if (result?.id) {
      console.log('has ID');
      await Promise.all([
        addCategories(http, result.id, categoryIds),
        addTeams(http, result.id, teamIds),
      ])
    }
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
