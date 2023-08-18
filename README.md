# Create Neelix Experience

This is a very simple GitHub action to create a Neelix Experience via the Neelix
API. It's intended to be used by other, more scenario-specific GitHub actions
developed by Neelix or for users wanting to provide inputs more directly when
creating Experiences.

## Usage

You will first need to obtain a Neelix API token for your action. Directions
can be found [here](https://platform.neelix.io/api). Be sure to keep your token
secure. We recommend storing it as a
[secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets).
Next get the ID for the consortium for your experiences. This can be found using the
[API Developer helper tool](https://platform.neelix.io/api-developer-helper).
Provide the target consortium ID to the action, as well as any additional
parameters you would like to include.

### Example:

```yaml
name: Create Neelix Experience

on: push

jobs:
  create-experience:
    runs-on: ubuntu-latest
    steps:
      - uses: neelix-io/create-experience-action@v1
        with:
          api-token: ${{ secrets.API_TOKEN }}
          consortium-id: ${{ vars.CONSORTIUM_ID }}
          commentary: "My experience commentary"
          weight: '1'
          activity-id: ${{ vars.ACTIVITY_ID }}
          category-ids: ${{ vars.CATEGORY_IDS }}
          team-ids: ${{ vars.TEAM_IDS }}
```




### Inputs

* api-token (required): A valid Neelix API token with access to the specified
  consortium
* consortium-id (required): ID of target consortium
* commentary: Sets `commentary` field of new experience. `null` if not provided.
* weight: Sets `weight` field of new experience. Default value of 0 used if
  not provided.
* activity-id: ID of an activity belonging to same consortium as experience.
  Sets `activity_id` field of new experience.
* category-ids: IDs of categories belonging to same consortium as experience.
  Use comma-separated list for multiple values (e.g. "1,2,3"). Adds specified
  categories to new experience.
* team-ids: IDs of teams belonging to same consortium as experience. Use
  comma-separated list for multiple values (e.g. "1,2,3"). Adds specified teams
  to new experience.
* external-ref: External reference url. Sets value of `external_ref` on new
  experience.

### Outputs

* experience-id: ID of created Experience

## Development

Build the project by running:

```
npm run build
```
