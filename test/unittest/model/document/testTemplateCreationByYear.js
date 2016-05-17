var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var async = require('async');
var helper = require('test/helperFunction');

like = require('chai-like');
chai.use(like);

var TemplateByYear = require('model/document/OfficialDocumentTemplate');

module.exports = function() {
	describe('Parameter validations', function() {

		it('should pass if year is a number or number string', function() {
			new TemplateByYear('xx', 123);
			new TemplateByYear('xy', '123');
		})

		it('should throw error if year is neither a number nor number string', function() {
			var invalidParameter = ['abc', '!@#$%^&*()-_=+<>/?', '', ' ', null, undefined];
			invalidParameter.forEach(function(parameter) {
				var expectedErrorMessage = /invalid/i;
				var testFailErrorMessage = parameter + ' does not throw an error';
				expect(function() {new TemplateByYear('xx', parameter);})
				.to.throw(Error, expectedErrorMessage, testFailErrorMessage);
			});
		});

		it('should throw error if year is negative integer', function() {
			expect(function() {new TemplateByYear('xx', -1)})
			.to.throw(Error, /invalid|negative/i, '-1 (integer) does not throw an error');
			expect(function() {new TemplateByYear('xx', '-1')})
			.to.throw(Error, /invalid|negative/i, '-1 (string) does not throw an error');
		});

		it('should throw error if subtype name contains spaces in-between', function() {
			expect(function() {new TemplateByYear('x x', 2000)})
			.to.throw(Error, /invalid|space/i);
		});

		it('should throw error if subtype name contains digits', function() {
			expect(function() {new TemplateByYear('x0123456789', 2000)})
			.to.throw(Error, /invalid/i);
			expect(function() {new TemplateByYear('xyz123456789', 2000)})
			.to.throw(Error, /invalid/i);
		});
		
		it('should uppercase subtype name', function() {
			var template = new TemplateByYear('xx', 2000);
			var SubtypeDocument = template.compile();

			var document = new SubtypeDocument();
			expect(document.subtype).to.exist;
			expect(document.subtype).to.equal('XX2000');
		});

	});

	describe('Template initialization', function() {
		var docsCurrentYear, docsNextYear;
		var year;
		var templateName;

		var SubtypeXX;
		var SubtypeXXNewYear;

		before(function() {
		 	year = 1234;
			templateName = 'zz';
			SubtypeXX = new TemplateByYear(templateName, year).compile();
			SubtypeXXNewYear = new TemplateByYear(templateName, year + 1).compile();
		});

		it('should reset auto-incrementing number to 1 when new year of the same subtype begins', function(done) { 
			var documentXX1 = new SubtypeXX({name: 'documentXX1'});
			var documentXX2 = new SubtypeXX({name: 'documentXX2'});

			var documentXXNewYear = new SubtypeXXNewYear({name: 'documentXXNewYear'});

			var items = [documentXX1, documentXX2, documentXXNewYear];
			var whenAllDone = function() {
				var sortDocumentNumberAscending = {docNum: 'ascending'};
				var xxDocQuery = SubtypeXX.find({}).sort(sortDocumentNumberAscending);
				var xxNewYearDocQuery = SubtypeXXNewYear.find({}).sort(sortDocumentNumberAscending);
				
				xxDocQuery.exec(function(err, docsXX) {
					expect(docsXX.length).to.equal(2);
					expect(docsXX[0].docNum).to.equal(1);
					expect(docsXX[1].docNum).to.equal(2);

					xxNewYearDocQuery.exec(function(err, docsXXNewYear) {
						expect(docsXXNewYear.length).to.equal(1);
						expect(docsXXNewYear[0].docNum).to.equal(1);
						done();
					});
				});
			}
			helper.saveMultipleItemsToDatabase(items, whenAllDone);
		});

		it('should have document ID in a correct format', function(done) {
			var documentXX3 = new SubtypeXX({name: 'documentXX3'});
			helper.saveMultipleItemsToDatabase([documentXX3], function() {
				var uppercaseTemplateName = templateName.toUpperCase();
				expect(documentXX3.id).to.exist;
				expect(documentXX3.id).to.equal(uppercaseTemplateName + year + '0003');
				done();
			})
		});
	});
}
