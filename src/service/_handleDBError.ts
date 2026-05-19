import ServiceError from '../core/serviceError';

const handleDBError = (error: any) => {
  const { code = '', message } = error;

  if (code === 'P2002') {
    switch (true) {
      case message.includes('idx_artist_name_unique'):
        throw ServiceError.validationFailed(
          'A artist with this name already exists',
        );
      case message.includes('idx_user_email_unique'):
        throw ServiceError.validationFailed(
          'There is already a user with this email address',
        );
      default:
        throw ServiceError.validationFailed('This item already exists');
    }
  }

  if (code === 'P2025') {
    switch (true) {
      case message.includes('fk_album_user'):
        throw ServiceError.notFound('This user does not exist');
      case message.includes('fk_album_artist'):
        throw ServiceError.notFound('This artist does not exist');
      case message.includes('album'):
        throw ServiceError.notFound('No album with this id exists');
      case message.includes('artist'):
        throw ServiceError.notFound('No artist with this id exists');
      case message.includes('user'):
        throw ServiceError.notFound('No user with this id exists');
    }
  }

  if (code === 'P2003') {
    switch (true) {
      case message.includes('artist_id'):
        throw ServiceError.conflict(
          'This artist is still linked to albums',
        );
      case message.includes('user_id'):
        throw ServiceError.conflict(
          'This user is still linked to albums',
        );
    }
  }

  // Rethrow error because we don't know what happened
  throw error;
};

export default handleDBError;
