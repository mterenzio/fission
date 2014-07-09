var util = require('util');

var AbstractError = function (msg, constr) {
    Error.captureStackTrace(this, constr || this)
    this.message = msg || 'Error'
}
util.inherits(AbstractError, Error)
AbstractError.prototype.name = 'Abstract Error';
AbstractError.prototype.code = 500;

var DatabaseError = function (msg) {
    DatabaseError.super_.call(this, msg, this.constructor)
}
util.inherits(DatabaseError, AbstractError)
DatabaseError.prototype.name = 'Database Transaction';

var MissingParameterError = function (msg) {
    MissingParameterError.super_.call(this, msg, this.constructor)
}

util.inherits(MissingParameterError, AbstractError)
MissingParameterError.prototype.name = 'Missing Parameter';
MissingParameterError.prototype.code = 409;

var InvalidContentError = function (msg) {
    InvalidContentError.super_.call(this, msg, this.constructor)
}

util.inherits(InvalidContentError, AbstractError)
InvalidContentError.prototype.name = 'Invalid Content';
InvalidContentError.prototype.code = 400;

var InvalidArgumentError = function (msg) {
    InvalidArgumentError.super_.call(this, msg, this.constructor)
}

util.inherits(InvalidArgumentError, AbstractError)
InvalidArgumentError.prototype.name = 'Invalid Argument';
InvalidArgumentError.prototype.code = 410;

var NotAuthorizedError = function (msg) {
    NotAuthorizedError.super_.call(this, msg, this.constructor)
}

util.inherits(NotAuthorizedError, AbstractError)
NotAuthorizedError.prototype.name = 'Not Authorized';
NotAuthorizedError.prototype.code = 403;

var InvalidCredentialsError = function (msg) {
    InvalidCredentialsError.super_.call(this, msg, this.constructor)
}

util.inherits(InvalidCredentialsError, AbstractError)
InvalidCredentialsError.prototype.name = 'Invalid Credentials';
InvalidCredentialsError.prototype.code = 401;

var EmailSentFailedError = function (msg) {
    EmailSentFailedError.super_.call(this, msg, this.constructor)
}

util.inherits(EmailSentFailedError, AbstractError)
EmailSentFailedError.prototype.name = 'Email Sent Failed';

var FileCreationError = function (msg) {
    FileCreationError.super_.call(this, msg, this.constructor)
}

util.inherits(FileCreationError, AbstractError)
FileCreationError.prototype.name = 'Failed to store image file';

var SoftwareVersionRejectedError = function (msg) {
    SoftwareVersionRejectedError.super_.call(this, msg, this.constructor)
}

util.inherits(SoftwareVersionRejectedError, AbstractError)
SoftwareVersionRejectedError.prototype.name = 'Software Version Rejected';
SoftwareVersionRejectedError.prototype.code = 457;

var ApiKeyRejectedError = function (msg) {
    ApiKeyRejectedError.super_.call(this, msg, this.constructor)
}

util.inherits(ApiKeyRejectedError, AbstractError)
ApiKeyRejectedError.prototype.name = 'Api Key Rejected';
ApiKeyRejectedError.prototype.code = 458;

var HttpRequestRejectedError = function (msg) {
    HttpRequestRejectedError.super_.call(this, msg, this.constructor)
}

util.inherits(HttpRequestRejectedError, AbstractError)
HttpRequestRejectedError.prototype.name = 'Http request Rejected';

var DataSyncError = function (msg) {
    DataSyncError.super_.call(this, msg, this.constructor)
}

util.inherits(DataSyncError, AbstractError)
DataSyncError.prototype.name = 'Data Sync Fail';
DataSyncError.prototype.code = 404;

module.exports = {
    Database: DatabaseError,
    MissingParameter:MissingParameterError,
    InvalidContent:InvalidContentError,
    InvalidArgument:InvalidArgumentError,
    NotAuthorized:NotAuthorizedError,
    InvalidCredentials:InvalidCredentialsError,
    EmailSentFailed:EmailSentFailedError,
    FileCreation:FileCreationError,
    SoftwareVersionRejected:SoftwareVersionRejectedError,
    ApiKeyRejected:ApiKeyRejectedError,
    HttpRequestRejected:HttpRequestRejectedError,
    DataSyncFail:DataSyncError
}
