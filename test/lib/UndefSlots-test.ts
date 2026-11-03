import { DataFactory } from 'rdf-data-factory';
import { JsonLdSerializer } from '../../index';

// rdf-undef: the empty slot of a sequence is a null in its list
const DF = new DataFactory();
const S = DF.namedNode('http://ex.org/s');
const P = DF.namedNode('http://ex.org/p');
const ONE = DF.literal('1');

function serialize(object: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const serializer = new JsonLdSerializer();
    let text = '';
    serializer.on('data', chunk => text += chunk);
    serializer.on('error', reject);
    serializer.on('end', () => resolve(JSON.parse(text)));
    serializer.write(DF.quad(S, P, object));
    serializer.end();
  });
}

describe('JsonLdSerializer with slots', () => {
  it('writes a slot as a null', async () => {
    const doc = await serialize(DF.sequence([ ONE, DF.undef() ]));
    expect(doc[0]['http://ex.org/p'][0]).toEqual({ '@list': [{ '@value': '1' }, null ]});
  });

  it('writes a slot at any depth', async () => {
    const doc = await serialize(DF.sequence([ DF.sequence([ DF.undef() ]), DF.undef() ]));
    expect(doc[0]['http://ex.org/p'][0]).toEqual({ '@list': [{ '@list': [ null ]}, null ]});
  });
});
