import { RequestHandler } from 'express';

import User from '@models/user';

export const getAuthorProfile: RequestHandler = async (req, res) => {
  const { authorId } = req.params;

  if (!authorId) return res.status(403).send({ error: 'Invalid request' });

  const user = await User.findOne({ _id: authorId });

  if (user?.userType !== 'author')
    return res
      .status(404)
      .send({ error: 'Invalid request, invalid userType/profile' });

  res.status(200).send({
    profile: {
      id: user._id,
      username: user.username,
      email: user.email,
      userType: user.userType,
    },
  });
};
