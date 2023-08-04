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

  core.warning('** UNRECOGNIZED RESULT **');
  core.warning(`status: ${res.statusCode}`);
  core.warning(`body: ${res.result}`);
}

const addCategories = async (
  http: httpm.HttpClient,
  experienceId: string,
  categoryIds: string,
) => {
  if (!categoryIds?.length) {
    return;
  }
  const url = `${API_URL}/experience/${experienceId}/categories`;
  const data = categoryIds.split(',');
  core.info(`sending PUT request to ${url} with data ${data}`);
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
  if (!teamIds?.length) {
    return;
  }
  const url = `${API_URL}/experience/${experienceId}/teams`;
  const data = teamIds.split(',');
  core.info(`sending PUT request to ${url} with data ${data}`);
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
    const categoryIds = core.getInput('category-ids');
    const teamIds = core.getInput('team-ids');
    const externalRef = core.getInput('external-ref');

    const rh = new auth.BearerCredentialHandler(apiToken);

    // TODO: update user agent name
    const http = new httpm.HttpClient('generic-action-gha', [rh]);

    const data = {
      consortium_id: consortiumId,
      commentary: commentary || DEFAULT_COMMENTARY,
      weight: weight || DEFAULT_WEIGHT,
      activity_id: activityId || null,
      external_ref: externalRef || null,
    };

    const result = await createExperience(http, data);
    core.info(`response body: ${JSON.stringify(result, null, 2)}`);
    if (result?.id) {
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
