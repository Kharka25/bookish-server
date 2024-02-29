import { RequestHandler } from 'express';

import { User } from '@models';

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

export const updateAuthorProfile: RequestHandler = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Invalid user' });

  if (user.userType !== 'author')
    return res
      .status(403)
      .json({ error: 'Invalid request, invalid userType/profile!' });
  res.send();
};
