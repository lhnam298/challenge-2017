import { ChallengePage } from './app.po';

describe('challenge App', () => {
  let page: ChallengePage;

  beforeEach(() => {
    page = new ChallengePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
