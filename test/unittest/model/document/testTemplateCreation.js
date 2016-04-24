var expect = require('chai').expect;

var templatePlain = require('model/document/template');
var subtypeDocumentTester = require('./testDocumentSubType');

module.exports = function() {
	it('should set correct subtype on a correct field', function() {
		var type = 'XX';
		var Doc = new templatePlain(type).compile();

		var xx = new Doc();
		expect(xx.subtype).to.exist;
		expect(xx.subtype).to.equals(type);
	});

	it("should include additional field if defined", function() {
		var type = 'XY';
		var additionalFields = {field1: Number, field2: Number, field3: Number};
		var additionalFieldsValue = {field1: 1, field2: 2, field3: 3};
		var Doc = new templatePlain(type, additionalFields).compile();
		var DocWithAdditionalFields = new Doc(additionalFieldsValue);

		DocWithAdditionalFields.save(function(err) {
			expect(DocWithAdditionalFields.field1).to.exist;
			expect(DocWithAdditionalFields.field1).to.equal(additionalFieldsValue.field1);
			expect(DocWithAdditionalFields.field2).to.exist;
			expect(DocWithAdditionalFields.field2).to.equal(additionalFieldsValue.field2);
			expect(DocWithAdditionalFields.field3).to.exist;
			expect(DocWithAdditionalFields.field3).to.equal(additionalFieldsValue.field3);
		})
	});

	describe('Document running number', function() {

		var typeName = ['@@', '123', 'A', ' B', 'C '];
		
		typeName.forEach(function(param) {
			describe('New sub type document: ' + param, function() {
				var subDoc = new templatePlain(param).compile();
				subtypeDocumentTester(subDoc);
			})
		});
	});

	
	it('Should throw error on empty sub type name', function() {
		expect(function() {
			new templatePlain('');
		}).to.throw(Error, /invalid/i);
	});

	it('should throw error if the template is compiled when there is one already exists in mongoose#model', function() {
		expect(function() {
			var templateAA1 = new templatePlain('aa').compile();
			var templateAA2 = new templatePlain('aa').compile();
		}).to.throw(Error, /already exist/i);
	});
}