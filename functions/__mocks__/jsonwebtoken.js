// __mocks__/jsonwebtoken.js
module.exports = {
    sign: jest.fn().mockReturnValue("mocked_token"),
};
