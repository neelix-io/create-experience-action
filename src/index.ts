import * as core from '@actions/core';
import * as httpm from '@actions/http-client';
import * as auth from '@actions/http-client/lib/auth';


type ExperienceData = {
  consortium_id: string;
  commentary: string;
}


const API_URL = `https://api.neelix.io/v1.2`;

const apiToken = core.getInput('api-token', { required: true });
const rh = new auth.BearerCredentialHandler(apiToken);
const http = new httpm.HttpClient('create-experience-ghaction', [rh]);


const createExperience = async (
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
}

const addCategories = async (experienceId: string, categoryIds: string) => {
  if (!categoryIds?.length) {
    return;
  }
  const url = `${API_URL}/experience/${experienceId}/categories`;
  const data = categoryIds.split(',');
  core.debug(`sending PUT request to ${url} with data ${data}`);
  const res = await http.putJson(url, data);
  if (res.statusCode >= 400) {
    throw new Error(`status: ${res.statusCode}; body: ${JSON.stringify(res.result)}`);
  }
}

const addTeams = async (experienceId: string, teamIds: string) => {
  if (!teamIds?.length) {
    return;
  }
  const url = `${API_URL}/experience/${experienceId}/teams`;
  const data = teamIds.split(',');
  core.debug(`sending PUT request to ${url} with data ${data}`);
  const res = await http.putJson(url, data);
  if (res.statusCode >= 400) {
    throw new Error(`status: ${res.statusCode}; body: ${JSON.stringify(res.result)}`);
  }
}

const run = async () => {
  try {
    const consortiumId = core.getInput('consortium-id', { required: true });
    const commentary = core.getInput('commentary');
    const weight = +core.getInput('weight');
    const activityId = +core.getInput('activity-id');
    const categoryIds = core.getInput('category-ids');
    const teamIds = core.getInput('team-ids');
    const externalRef = core.getInput('external-ref');

    const data = {
      consortium_id: consortiumId,
      commentary: commentary,
      weight: weight,
      activity_id: activityId || null,
      external_ref: externalRef || null,
    };

    const result = await createExperience(data);
    core.debug(`response body: ${JSON.stringify(result, null, 2)}`);
    if (!result?.id) {
      throw new Error('response did not include experience ID');
    }

    await Promise.all([
      addCategories(result.id, categoryIds),
      addTeams(result.id, teamIds),
    ]);
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
