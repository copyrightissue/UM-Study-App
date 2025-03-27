// __mocks__/bcryptjs.js
module.exports = {
    hash: jest.fn().mockResolvedValue("hashedPassword"),
    compare: jest.fn().mockResolvedValue(true),
};
