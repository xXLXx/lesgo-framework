import { LesgoException } from '../../exceptions';
import jwtConfig from '../../config/jwt';

const FILE = 'lesgo.services.JWTService.getJwtSecret';

export interface GetJwtSecretInput {
  secret?: string;
  keyid?: string;
}

const getJwtSecret = (input: GetJwtSecretInput) => {
  let { secret, keyid } = input;

  if (!secret) {
    secret = jwtConfig.secrets[0]?.secret;
  }

  if (keyid) {
    secret = jwtConfig.secrets.find(s => s?.keyid === keyid)?.secret;

    if (!secret) {
      throw new LesgoException(
        `kid ${input.keyid} not found.`,
        `${FILE}::KID_NOT_FOUND`
      );
    }
  }

  if (!secret) {
    throw new LesgoException(
      'Missing Secret to sign JWT',
      `${FILE}::SECRET_NOT_FOUND`
    );
  }

  return secret;
};

export default getJwtSecret;
