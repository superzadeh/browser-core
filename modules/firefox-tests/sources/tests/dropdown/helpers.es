/* global window, chai */

// TODO: remove wrapper when all tests will land in single bundle
// it is only needed as we cannot acqure references to all object on loading time
const wrap = getObj => new Proxy({}, {
  get(target, name) {
    const obj = getObj();
    let prop = obj[name];

    if (typeof prop === 'function') {
      prop = prop.bind(obj);
    }
    return prop;
  },
  set(target, name, value) {
    const obj = getObj();
    obj[name] = value;
    return true;
  },
});

export const app = wrap(() => window.app);
export const clearIntervals = (...args) => window.clearIntervals(...args);
export const click = (...args) => window.click(...args);
export const $cliqzResults = wrap(() => window.$cliqzResults);
export const CliqzUtils = wrap(() => window.CliqzUtils);
export const $dropdown = wrap(() => window.$dropdown);
export const expect = chai.expect;
export const fastFillIn = (...args) => window.fastFillIn(...args);
export const fillIn = (...args) => window.fillIn(...args);
export const getComputedStyle = (...args) => window.getComputedStyle(...args);
export const getLocalisedString = (...args) => window.getLocalisedString(...args);
export const getLocaliseString = (...args) => window.getLocaliseString(...args);
export const patchGeolocation = (...args) => window.patchGeolocation(...args);
export const press = (...args) => window.press(...args);
export const pressAndWaitFor = (...args) => window.pressAndWaitFor(...args);
export const release = (...args) => window.release(...args);
export const respondWith = (...args) => window.respondWith(...args);
export const respondWithSnippet = (...args) => window.respondWithSnippet(...args);
export const respondWithSuggestions = (...args) => window.respondWithSuggestions(...args);
export const setUserInput = (...args) => window.setUserInput(...args);
export const urlbar = wrap(() => CliqzUtils.getWindow().gURLBar);
export const waitFor = (...args) => window.waitFor(...args);
export const waitForAsync = (...args) => window.waitForAsync(...args);
export const waitForPopup = (...args) => window.waitForPopup(...args);
export const waitForPopupClosed = (...args) => window.waitForPopupClosed(...args);
export const withHistory = (...args) => window.withHistory(...args);
export function blurUrlBar() {
  urlbar.mInputField.setUserInput('');
  urlbar.blur();
  urlbar.mInputField.blur();
  CliqzUtils.getWindow().CLIQZ.UI.renderer.close();
}

const mainResultSelector = '.cliqz-result:not(.history)';

/* Check if the main SC area has been rendered
  * @param {object} $result - dropdown element
  * @param (boolean) isPresent - defines if testing presense
      or absence of the main result
*/
export function checkMainResult({ $result, isPresent = true }) {
  if (isPresent) {
    it('renders result successfully', function () {
      const $mainResult = $result.querySelector(mainResultSelector);
      expect($mainResult).to.exist;
    });
  } else {
    it('does not render main result', function () {
      const $mainResult = $result.querySelector(mainResultSelector);
      expect($mainResult).to.not.exist;
    });
  }
}

/* Check if the main SC area has been rendered
  * @param {object} $result - dropdown element
  * @param {object} historyResults - mocked history response
  * @param (boolean) isPresent - defines if testing presense
      or absence of the history result
*/
export function checkhistoryResult({ $result, historyResults, isPresent = true }) {
  const historyResultSelector = '.cliqz-result.history';
  const singleHistorySelector = 'a.result:not(.sessions)';
  const $historySearchSelector = '.cliqz-result.history.last .sessions';
  const historyLogoSelector = '.logo';
  const historyDescriptionSelector = '.abstract .title';
  const historyUrlSelector = '.abstract .url';
  const historySearchIconSelector = '.history-tool';
  const $historySearchTextSelector = '.abstract span';

  if (isPresent) {
    describe('renders history result', function () {
      it('successfully', function () {
        const $historyResult = $result.querySelector(historyResultSelector);
        expect($historyResult).to.exist;
      });

      it('with correct amount of elements', function () {
        const $allHistoryElements = $result
          .querySelectorAll(`${historyResultSelector} ${singleHistorySelector}`);
        expect($allHistoryElements.length).to.equal(historyResults.length);
      });

      it('with an option to search in all history results', function () {
        const $historySearch = $result.querySelectorAll($historySearchSelector);
        expect($historySearch).to.exist;
      });
    });

    context('each rendered history result', function () {
      it('has an existing logo', function () {
        const $allHistoryElements = $result
          .querySelectorAll(`${historyResultSelector} ${singleHistorySelector}`);

        [...$allHistoryElements].forEach(function ($history) {
          expect($history.querySelector(historyLogoSelector)).to.exist;
        });
      });

      it('has an existing and correct description', function () {
        const $allHistoryElements = $result
          .querySelectorAll(`${historyResultSelector} ${singleHistorySelector}`);

        [...$allHistoryElements].forEach(function ($history, historyIndex) {
          expect($history.querySelector(historyDescriptionSelector))
            .to.contain.text(historyResults[historyIndex].comment);
        });
      });

      it('has an existing domain', function () {
        const $allHistoryElements = $result
          .querySelectorAll(`${historyResultSelector} ${singleHistorySelector}`);

        [...$allHistoryElements].forEach(function ($history) {
          expect($history.querySelector(historyUrlSelector)).to.exist;
        });
      });

      it('links to a correct URL', function () {
        const $allHistoryElements = $result
          .querySelectorAll(`${historyResultSelector} ${singleHistorySelector}`);

        [...$allHistoryElements].forEach(function ($history, historyIndex) {
          expect($history.href).to.exist;
          expect($history.href)
            .to.equal(historyResults[historyIndex].value);
        });
      });
    });

    context('the option to search in all history results', function () {
      it('has an existing and correct icon', function () {
        const $historySearchIcon = $result
          .querySelector(`${$historySearchSelector} ${historySearchIconSelector}`);

        expect($historySearchIcon).to.exist;
        expect(window.getComputedStyle($historySearchIcon).backgroundImage)
          .to.contain('history_tool_grey');
      });

      it('has existing and correct text', function () {
        const $historySearchText = $result
          .querySelectorAll(`${$historySearchSelector} ${$historySearchTextSelector}`);
        const foundInHistory = getLocalisedString().results_found_in_history.message;

        expect($historySearchText).to.contain.text(foundInHistory);
      });
    });
  } else {
    it('does not render history result', function () {
      const $historyResult = $result.querySelector(historyResultSelector);
      expect($historyResult).to.not.exist;
    });
  }
}

function checkSoccerCommon({ $result, results }) {
  const soccerAreaSelector = '.soccer';
  const domainSelector = '.soccer-domain:not(.divider)';
  const titleSelector = 'a.soccer-title';
  const captionSelector = 'a.powered-by';

  describe('renders title', function () {
    it('successfully', function () {
      const $title = $result
        .querySelector(`${mainResultSelector} ${titleSelector} .padded`);

      expect($title).to.exist;
      expect($title).to.have.text(results[0].snippet.extra.title);
    });

    it('with a correct URL', function () {
      const $title = $result
        .querySelector(`${mainResultSelector} ${titleSelector}`);

      expect($title).to.exist;
      expect($title.href).to.exist;
      expect($title.href).to.equal(results[0].snippet.extra.url);
    });

    it('with a correct domain', function () {
      const $domain = $result
        .querySelector(`${mainResultSelector} ${domainSelector}`);

      expect($domain).to.exist;
      expect($domain).to.have.text('kicker.de');
    });
  });

  it('renders correct "Powered by" caption', function () {
    const $caption = $result
      .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${captionSelector}`);

    expect($caption).to.exist;
    expect($caption).to.contain.text(getLocalisedString().soccer_powered_by.message);
  });
}

export function checkSoccerLigaGame({ $result, results, isExpanded = false }) {
  const soccerAreaSelector = '.soccer';
  const rowSelector = 'a.table-row.result';
  const teamSelector = '.fixed-width';
  const teamLogoSelector = '.club-logo-img';
  const scoreSelector = '.scored';
  const dateSelector = '.time';
  const leagueLogoSelector = '.league-logo';
  const showMoreSelector = 'a.expand-btn';

  const newsAreaSelector = '.news-injection';
  const newsHeaderSelector = '.news-injection-title';
  const newsElementSelector = 'a.result';
  const newsThumbnailSelector = '.thumbnail img';
  const newsTitleSelector = '.content .title';
  const newsDomainSelector = '.content .url';
  const newsTimestampSelector = '.content .published-at';

  checkSoccerCommon({ $result, results });

  describe('renders results table', function () {
    it('successfully', function () {
      const $soccerTable = $result
        .querySelector(`${mainResultSelector} ${soccerAreaSelector}`);
      expect($soccerTable).to.exist;
    });

    it('with details of correct amount of matches', function () {
      let amountOfRows = 2;
      if (isExpanded) { amountOfRows = 3; }

      const $allRows = $result
        .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);
      expect($allRows.length).to.equal(amountOfRows);
    });

    if (isExpanded) {
      it('without "Show more" button', function () {
        const $showMore = $result
          .querySelector(`${mainResultSelector} ${soccerAreaSelector} ${showMoreSelector}`);

        expect($showMore).to.not.exist;
      });
    } else {
      it('with a correct "Show more" being a link', function () {
        const $showMore = $result
          .querySelector(`${mainResultSelector} ${soccerAreaSelector} ${showMoreSelector}`);

        expect($showMore).to.exist;
        expect($showMore.href).to.exist;
        expect($showMore).to.contain.text(getLocalisedString().soccer_expand_button.message);
      });
    }
  });

  context('each table match row', function () {
    it('has a correct URL', function () {
      const $allRows = $result
        .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

      expect($allRows.length).to.be.above(0);
      [...$allRows].forEach(function ($row, i) {
        expect($row.href).to.exist;
        expect($row.href)
          .to.equal(results[0].snippet.extra.matches[i].live_url);
      });
    });

    it('has correct names of two teams', function () {
      const $allRows = $result
        .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

      expect($allRows.length).to.be.above(0);
      [...$allRows].forEach(function ($row, i) {
        const soccerTeamItem = $row.querySelectorAll(teamSelector);
        expect(soccerTeamItem.length).to.equal(2);
        expect(soccerTeamItem[0]).to.have.text(results[0].snippet.extra.matches[i].HOST);
        expect(soccerTeamItem[1]).to.have.text(results[0].snippet.extra.matches[i].GUESS);
      });
    });

    it('has logos of two teams', function () {
      const $allRows = $result
        .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

      expect($allRows.length).to.be.above(0);
      [...$allRows].forEach(function ($row, i) {
        const $allSoccerTeamLogos = $row.querySelectorAll(teamLogoSelector);
        expect($allSoccerTeamLogos.length).to.equal(2);

        expect(getComputedStyle($allSoccerTeamLogos[0]).backgroundImage)
          .to.contain(results[0].snippet.extra.matches[i].hostLogo);

        expect(getComputedStyle($allSoccerTeamLogos[1]).backgroundImage)
          .to.contain(results[0].snippet.extra.matches[i].guestLogo);
      });
    });

    it('has a result with correct two numbers', function () {
      const $allRows = $result
        .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

      expect($allRows.length).to.be.above(0);
      [...$allRows].forEach(function ($row, i) {
        const $score = $row.querySelector(scoreSelector);
        expect($score)
          .to.contain.text(results[0].snippet.extra.matches[i].scored);
      });
    });

    it('has an existing date and time', function () {
      const $allRows = $result
        .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

      expect($allRows.length).to.be.above(0);
      [...$allRows].forEach(function ($row) {
        const soccerDateItem = $row.querySelector(dateSelector);
        expect(soccerDateItem).to.exist;
      });
    });

    it('has a correct league logo', function () {
      const $allRows = $result
        .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

      expect($allRows.length).to.be.above(0);
      [...$allRows].forEach(function ($row, i) {
        const $leagueLogo = $row.querySelector(leagueLogoSelector);

        expect($leagueLogo).to.exist;
        expect(getComputedStyle($leagueLogo).backgroundImage)
          .to.contain(results[0].snippet.extra.matches[i].leagueLogo);
      });
    });
  });

  context('renders news area', function () {
    it('successfully', function () {
      const $soccerNews = $result
        .querySelector(`${mainResultSelector} ${newsAreaSelector}`);
      expect($soccerNews).to.exist;
    });

    it('with an existing and correct header', function () {
      const $newsHeader = $result
        .querySelector(`${mainResultSelector} ${newsHeaderSelector}`);

      expect($newsHeader).to.exist;
      expect($newsHeader).to.have.text(getLocalisedString().soccer_news_title.message);
    });

    it('with two news items', function () {
      const $allNews = $result
        .querySelectorAll(`${mainResultSelector} ${newsAreaSelector} ${newsElementSelector}`);
      expect($allNews.length).to.equal(2);
    });

    context('each news item', function () {
      it('has a correct thumbnail', function () {
        const $allNews = $result
          .querySelectorAll(`${mainResultSelector} ${newsAreaSelector} ${newsElementSelector}`);

        expect($allNews.length).to.be.above(0);
        [...$allNews].forEach(function ($element, i) {
          const $newsThumbnail = $element.querySelector(newsThumbnailSelector);

          expect($newsThumbnail).to.exist;
          expect($newsThumbnail.src)
            .to.equal(results[0].snippet.deepResults[1].links[i].extra.thumbnail);
        });
      });

      it('has a correct title', function () {
        const $allNews = $result
          .querySelectorAll(`${mainResultSelector} ${newsAreaSelector} ${newsElementSelector}`);

        expect($allNews.length).to.be.above(0);
        [...$allNews].forEach(function ($element, i) {
          const $newsTitle = $element.querySelector(newsTitleSelector);

          expect($newsTitle).to.exist;
          expect($newsTitle)
            .to.have.text(results[0].snippet.deepResults[1].links[i].title);
        });
      });

      it('has an existing and correct domain', function () {
        const $allNews = $result
          .querySelectorAll(`${mainResultSelector} ${newsAreaSelector} ${newsElementSelector}`);

        expect($allNews.length).to.be.above(0);
        [...$allNews].forEach(function ($element, i) {
          const $newsDomain = $element.querySelector(newsDomainSelector);

          expect($newsDomain).to.exist;
          expect($newsDomain)
            .to.have.text(results[0].snippet.deepResults[1].links[i].extra.domain);
        });
      });

      it('has an existing timestamp', function () {
        const $allNews = $result
          .querySelectorAll(`${mainResultSelector} ${newsAreaSelector} ${newsElementSelector}`);

        expect($allNews.length).to.be.above(0);
        [...$allNews].forEach(function ($element) {
          const $newsTimestamp = $element.querySelector(newsTimestampSelector);
          expect($newsTimestamp).to.exist;
        });
      });

      it('has an existing and correct URL', function () {
        const $allNews = $result
          .querySelectorAll(`${mainResultSelector} ${newsAreaSelector} ${newsElementSelector}`);

        expect($allNews.length).to.be.above(0);
        [...$allNews].forEach(function ($element, i) {
          expect($element.href).to.exist;
          expect($element.href)
            .to.equal(results[0].snippet.deepResults[1].links[i].url);
        });
      });
    });
  });
}

export function checkSoccerLigaTable({ $result, results, isExpanded = false }) {
  const soccerAreaSelector = '.soccer';
  const rowSelector = '.table-row';
  const showMoreSelector = 'a.expand-btn';
  const teamsHeaderSelector = '.table-header';
  const tableCellSelector = '.table-cell';

  checkSoccerCommon({ $result, results });

  describe('renders results table', function () {
    it('successfully', function () {
      const $soccerTable = $result
        .querySelector(`${mainResultSelector} ${soccerAreaSelector}`);
      expect($soccerTable).to.exist;
    });

    it('with details of correct amount of teams', function () {
      const $allRows = $result
        .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

      if (!isExpanded) {
        expect($allRows.length).to.equal(6);
      } else {
        expect($allRows.length).to.equal(results[0].snippet.extra.ranking.length);
      }
    });

    if (isExpanded) {
      it('without "Show more" button', function () {
        const $showMore = $result
          .querySelector(`${mainResultSelector} ${soccerAreaSelector} ${showMoreSelector}`);

        expect($showMore).to.not.exist;
      });
    } else {
      it('with a correct "Show more" being a link', function () {
        const $showMore = $result
          .querySelector(`${mainResultSelector} ${soccerAreaSelector} ${showMoreSelector}`);

        expect($showMore).to.exist;
        expect($showMore.href).to.exist;
        expect($showMore).to.contain.text(getLocalisedString().soccer_expand_button.message);
      });
    }

    describe('renders teams header', function () {
      it('successfully', function () {
        const $teamsHeader = $result
          .querySelector(`${mainResultSelector} ${soccerAreaSelector} ${teamsHeaderSelector}`);
        expect($teamsHeader).to.exist;
      });

      it('with correct amount of elements', function () {
        const $allTeamsHeaders = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${teamsHeaderSelector} ${tableCellSelector}`);
        expect($allTeamsHeaders.length).to.equal(10);
      });

      it('with each element having a correct label', function () {
        const $allTeamsHeaders = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${teamsHeaderSelector} ${tableCellSelector}`);

        expect($allTeamsHeaders[0])
          .to.have.text(results[0].snippet.extra.info_list.rank);
        /* Column #1 has no header */
        expect($allTeamsHeaders[2])
          .to.have.text(results[0].snippet.extra.info_list.club);
        expect($allTeamsHeaders[3])
          .to.have.text(results[0].snippet.extra.info_list.SP);
        expect($allTeamsHeaders[4])
          .to.have.text(results[0].snippet.extra.info_list.S);
        expect($allTeamsHeaders[5])
          .to.have.text(results[0].snippet.extra.info_list.N);
        expect($allTeamsHeaders[6])
          .to.have.text(results[0].snippet.extra.info_list.U);
        expect($allTeamsHeaders[7])
          .to.have.text(results[0].snippet.extra.info_list.goals);
        expect($allTeamsHeaders[8])
          .to.have.text(results[0].snippet.extra.info_list.TD);
        expect($allTeamsHeaders[9])
          .to.have.text(results[0].snippet.extra.info_list.PKT);
      });
    });

    context('each team row', function () {
      it('has a correct index', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $index = $row.querySelectorAll(tableCellSelector)[0];
          expect($index).to.have.text(`${i + 1}`);
        });
      });

      it('has a correct team logo', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $logo = $row
            .querySelectorAll(tableCellSelector)[1].querySelector('div');

          expect(getComputedStyle($logo).backgroundImage)
            .to.contain(results[0].snippet.extra.ranking[i].logo);
        });
      });

      it('has a correct team name', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $team = $row.querySelectorAll(tableCellSelector)[2];
          expect($team)
            .to.have.text(results[0].snippet.extra.ranking[i].club);
        });
      });

      it('has a correct amount of matches', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $matches = $row.querySelectorAll(tableCellSelector)[3];
          expect($matches)
            .to.have.text(results[0].snippet.extra.ranking[i].SP.toString());
        });
      });

      it('has an existing and correct amount of victories', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $victories = $row.querySelectorAll(tableCellSelector)[4];
          expect($victories)
            .to.have.text(results[0].snippet.extra.ranking[i].S.toString());
        });
      });

      it('has an existing and correct amount of losses', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $losses = $row.querySelectorAll(tableCellSelector)[5];
          expect($losses)
            .to.have.text(results[0].snippet.extra.ranking[i].N.toString());
        });
      });

      it('has an existing and correct amount of ties', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $ties = $row.querySelectorAll(tableCellSelector)[6];
          expect($ties)
            .to.have.text(results[0].snippet.extra.ranking[i].U.toString());
        });
      });

      it('has an existing and correct amount of goals', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $goals = $row.querySelectorAll(tableCellSelector)[7];
          expect($goals)
            .to.have.text(results[0].snippet.extra.ranking[i].goals);
        });
      });

      it('has an existing and correct difference of goals', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $difference = $row.querySelectorAll(tableCellSelector)[8];
          expect($difference)
            .to.have.text(results[0].snippet.extra.ranking[i].TD.toString());
        });
      });

      it('has an existing and correct amount of points', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $points = $row.querySelectorAll(tableCellSelector)[9];
          expect($points)
            .to.have.text(results[0].snippet.extra.ranking[i].PKT.toString());
        });
      });
    });
  });
}

export function checkSoccerLeague({ $result, results, activeTabIdx = 0 }) {
  const soccerAreaSelector = '.soccer';
  const tabsHeaderSelector = '.dropdown-tabs';
  const tabsGroupLabelSelector = '.dropdown-tab-header';
  const tabSelector = '.dropdown-tab';
  const rowSelector = `#tab-block-${activeTabIdx} .table-row`;
  const teamsHeaderSelector = `#tab-block-${activeTabIdx} .table-header`;
  const tableCellSelector = '.table-cell';

  checkSoccerCommon({ $result, results });

  describe('renders results table', function () {
    it('successfully', function () {
      const $soccerTable = $result
        .querySelector(`${mainResultSelector} ${soccerAreaSelector}`);
      expect($soccerTable).to.exist;
    });

    it('with details of correct amount of teams', function () {
      const $allRows = $result
        .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);
      expect($allRows.length).to.equal(results[0].snippet.extra.groups[0].ranking.length);
    });

    describe('renders tab header', function () {
      it('successfully', function () {
        const $tabsHeader = $result
          .querySelector(`${mainResultSelector} ${soccerAreaSelector} ${tabsHeaderSelector}`);
        expect($tabsHeader).to.exist;
      });

      it('with a correct "Group" label', function () {
        const $tabsGroupLabel = $result
          .querySelector(`${mainResultSelector} ${soccerAreaSelector} ${tabsHeaderSelector} ${tabsGroupLabelSelector}`);

        expect($tabsGroupLabel).to.exist;
        expect($tabsGroupLabel).to.contain.text(results[0].snippet.extra.group_name);
      });

      it('with a correct number of rendered tabs', function () {
        const $allTabs = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${tabsHeaderSelector} ${tabSelector}`);
        expect($allTabs.length).to.equal(results[0].snippet.extra.groups.length);
      });

      it(`with tab #${activeTabIdx} selected as default`, function () {
        const $allTabs = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${tabsHeaderSelector} ${tabSelector}`);

        expect($allTabs.length).to.be.above(0);
        [...$allTabs].forEach(function ($tab) {
          if ($tab.id === `tab-${activeTabIdx}`) {
            expect($tab.classList.contains('checked')).to.equal(true);
          } else {
            expect($tab.classList.contains('checked')).to.equal(false);
          }
        });
      });
    });

    describe('renders teams header', function () {
      it('successfully', function () {
        const $teamsHeader = $result
          .querySelector(`${mainResultSelector} ${soccerAreaSelector} ${teamsHeaderSelector}`);
        expect($teamsHeader).to.exist;
      });

      it('with correct amount of elements', function () {
        const $allTeamsHeaders = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${teamsHeaderSelector} ${tableCellSelector}`);
        expect($allTeamsHeaders.length).to.equal(10);
      });

      it('with each element having a correct label', function () {
        const $allTeamsHeaders = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${teamsHeaderSelector} ${tableCellSelector}`);

        expect($allTeamsHeaders[0])
          .to.have.text(results[0].snippet.extra.groups[0].info_list.rank);
        /* Column #1 has no header */
        expect($allTeamsHeaders[2])
          .to.have.text(results[0].snippet.extra.groups[0].info_list.club);
        expect($allTeamsHeaders[3])
          .to.have.text(results[0].snippet.extra.groups[0].info_list.SP);
        expect($allTeamsHeaders[4])
          .to.have.text(results[0].snippet.extra.groups[0].info_list.S);
        expect($allTeamsHeaders[5])
          .to.have.text(results[0].snippet.extra.groups[0].info_list.N);
        expect($allTeamsHeaders[6])
          .to.have.text(results[0].snippet.extra.groups[0].info_list.U);
        expect($allTeamsHeaders[7])
          .to.have.text(results[0].snippet.extra.groups[0].info_list.goals);
        expect($allTeamsHeaders[8])
          .to.have.text(results[0].snippet.extra.groups[0].info_list.TD);
        expect($allTeamsHeaders[9])
          .to.have.text(results[0].snippet.extra.groups[0].info_list.PKT);
      });
    });

    context('each team row', function () {
      it('has a correct index', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $index = $row.querySelectorAll(tableCellSelector)[0];
          expect($index).to.have.text(`${i + 1}`);
        });
      });

      it('has a correct team logo', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $logo = $row
            .querySelectorAll(tableCellSelector)[1].querySelector('div');

          expect(getComputedStyle($logo).backgroundImage)
            .to.contain(results[0].snippet.extra.groups[activeTabIdx].ranking[i].logo);
        });
      });

      it('has a correct team name', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $team = $row.querySelectorAll(tableCellSelector)[2];
          expect($team)
            .to.have.text(results[0].snippet.extra.groups[activeTabIdx].ranking[i].club);
        });
      });

      it('has a correct amount of matches', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $matches = $row.querySelectorAll(tableCellSelector)[3];
          expect($matches)
            .to.have.text(results[0].snippet.extra.groups[activeTabIdx].ranking[i].SP.toString());
        });
      });

      it('has an existing and correct amount of victories', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $victories = $row.querySelectorAll(tableCellSelector)[4];
          expect($victories)
            .to.have.text(results[0].snippet.extra.groups[activeTabIdx].ranking[i].S.toString());
        });
      });

      it('has an existing and correct amount of losses', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $losses = $row.querySelectorAll(tableCellSelector)[5];
          expect($losses)
            .to.have.text(results[0].snippet.extra.groups[activeTabIdx].ranking[i].N.toString());
        });
      });

      it('has an existing and correct amount of ties', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $ties = $row.querySelectorAll(tableCellSelector)[6];
          expect($ties)
            .to.have.text(results[0].snippet.extra.groups[activeTabIdx].ranking[i].U.toString());
        });
      });

      it('has an existing and correct amount of goals', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $goals = $row.querySelectorAll(tableCellSelector)[7];
          expect($goals)
            .to.have.text(results[0].snippet.extra.groups[activeTabIdx].ranking[i].goals);
        });
      });

      it('has an existing and correct difference of goals', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $difference = $row.querySelectorAll(tableCellSelector)[8];
          expect($difference)
            .to.have.text(results[0].snippet.extra.groups[activeTabIdx].ranking[i].TD.toString());
        });
      });

      it('has an existing and correct amount of points', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $points = $row.querySelectorAll(tableCellSelector)[9];
          expect($points)
            .to.have.text(results[0].snippet.extra.groups[activeTabIdx].ranking[i].PKT.toString());
        });
      });
    });
  });
}

export function checkSoccerLiveticker({ $result, results, isExpanded = false, activeTabIdx = 2 }) {
  const soccerAreaSelector = '.soccer';
  const tabsHeaderSelector = '.dropdown-tabs';
  const tabSelector = '.dropdown-tab';
  const rowSelector = `#tab-block-${activeTabIdx} .table-row`;
  const teamSelector = '.fixed-width';
  const teamLogoSelector = '.club-logo-img';
  const scoreSelector = '.scored';
  const dateSelector = '.time';
  const leagueLogoSelector = '.league-logo';
  const showMoreSelector = 'a.expand-btn';

  checkSoccerCommon({ $result, results });

  describe('renders results table', function () {
    it('successfully', function () {
      const $soccerTable = $result
        .querySelector(`${mainResultSelector} ${soccerAreaSelector}`);
      expect($soccerTable).to.exist;
    });

    it('with details of correct amount of matches', function () {
      const $allRows = $result
        .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

      if (!isExpanded) {
        expect($allRows.length).to.equal(2);
      } else {
        expect($allRows.length)
          .to.equal(results[0].snippet.extra.weeks[activeTabIdx].matches.length);
      }
    });

    if (isExpanded) {
      it('without "Show more" button', function () {
        const $showMore = $result
          .querySelector(`${mainResultSelector} ${soccerAreaSelector} ${showMoreSelector}`);

        expect($showMore).to.not.exist;
      });
    } else {
      it('with a correct "Show more" being a link', function () {
        const $showMore = $result
          .querySelector(`${mainResultSelector} ${soccerAreaSelector} ${showMoreSelector}`);

        expect($showMore).to.exist;
        expect($showMore.href).to.exist;
        expect($showMore).to.contain.text(getLocalisedString().soccer_expand_button.message);
      });
    }

    describe('renders tab header', function () {
      it('successfully', function () {
        const $tabsHeader = $result
          .querySelector(`${mainResultSelector} ${soccerAreaSelector} ${tabsHeaderSelector}`);
        expect($tabsHeader).to.exist;
      });

      it('with a correct number of rendered tabs', function () {
        const $allTabs = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${tabsHeaderSelector} ${tabSelector}`);
        expect($allTabs.length).to.equal(results[0].snippet.extra.weeks.length);
      });

      it(`with tab #${activeTabIdx} selected as default`, function () {
        const $allTabs = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${tabsHeaderSelector} ${tabSelector}`);

        expect($allTabs.length).to.be.above(0);
        [...$allTabs].forEach(function ($tab) {
          if ($tab.id === `tab-${activeTabIdx}`) {
            expect($tab.classList.contains('checked')).to.equal(true);
          } else {
            expect($tab.classList.contains('checked')).to.equal(false);
          }
        });
      });
    });

    context('each table match row', function () {
      it('has a correct URL', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          expect($row.href).to.exist;
          expect($row.href)
            .to.equal(results[0].snippet.extra.weeks[activeTabIdx].matches[i].live_url);
        });
      });

      it('has correct names of two teams', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const soccerTeamItem = $row.querySelectorAll(teamSelector);
          expect(soccerTeamItem.length).to.equal(2);
          expect(soccerTeamItem[0])
            .to.have.text(results[0].snippet.extra.weeks[activeTabIdx].matches[i].HOST);
          expect(soccerTeamItem[1])
            .to.have.text(results[0].snippet.extra.weeks[activeTabIdx].matches[i].GUESS);
        });
      });

      it('has logos of two teams', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $allSoccerTeamLogos = $row.querySelectorAll(teamLogoSelector);
          expect($allSoccerTeamLogos.length).to.equal(2);

          expect(getComputedStyle($allSoccerTeamLogos[0]).backgroundImage)
            .to.contain(results[0].snippet.extra.weeks[activeTabIdx].matches[i].hostLogo);

          expect(getComputedStyle($allSoccerTeamLogos[1]).backgroundImage)
            .to.contain(results[0].snippet.extra.weeks[activeTabIdx].matches[i].guestLogo);
        });
      });

      it('has a result with correct two numbers', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $score = $row.querySelector(scoreSelector);
          expect($score)
            .to.contain.text(results[0].snippet.extra.weeks[activeTabIdx].matches[i].scored);
        });
      });

      it('has an existing date and time', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row) {
          const soccerDateItem = $row.querySelector(dateSelector);
          expect(soccerDateItem).to.exist;
        });
      });

      it('has a correct league logo', function () {
        const $allRows = $result
          .querySelectorAll(`${mainResultSelector} ${soccerAreaSelector} ${rowSelector}`);

        expect($allRows.length).to.be.above(0);
        [...$allRows].forEach(function ($row, i) {
          const $leagueLogo = $row.querySelector(leagueLogoSelector);

          expect($leagueLogo).to.exist;
          expect(getComputedStyle($leagueLogo).backgroundImage)
            .to.contain(results[0].snippet.extra.weeks[activeTabIdx].matches[i].leagueLogo);
        });
      });
    });
  });
}

export function checkSearchResult({ $result, query, urlText = 'Search with Google' }) {
  const resultSelector = '.result';
  const searchResultSelector = '.search';
  const logoSelector = '.icons .icon.search';
  const querySelector = '.abstract .strong';
  const $urlSelector = '.abstract .url';

  describe('renders search result', function () {
    it('successfully', function () {
      const $searchResult = $result
        .querySelector(`${resultSelector}${searchResultSelector}`);
      expect($searchResult).to.exist;
    });

    it('as the only result', function () {
      const $allResults = $result.querySelectorAll(resultSelector);
      expect($allResults.length).to.equal(1);
    });

    it('with correct logo', function () {
      const $logo = $result
        .querySelector(`${resultSelector}${searchResultSelector} ${logoSelector}`);
      expect($logo).to.exist;
    });

    it('with correct query', function () {
      const $query = $result
        .querySelector(`${resultSelector}${searchResultSelector} ${querySelector}`);

      expect($query).to.exist;
      expect($query).to.contain.text(query);
    });

    it('with correct URL', function () {
      const $url = $result
        .querySelector(`${resultSelector}${searchResultSelector} ${$urlSelector}`);

      expect($url).to.exist;
      expect($url).to.contain.text(urlText);
    });
  });
}

/** Check if result buttons have been rendered
  * @param {object} $result - dropdown element
  * @param {object} results - mocked backend response
*/
export function checkButtons({ $result, results }) {
  const buttonsAreaSelector = '.buttons';
  const buttonSelector = '.btn';

  context('renders buttons area', function () {
    it('successfully', function () {
      const $buttonsArea = $result.querySelector(buttonsAreaSelector);
      expect($buttonsArea).to.exist;
    });

    it('with correct amount of buttons', function () {
      const $allButtons = $result.querySelectorAll(buttonSelector);
      expect($allButtons.length).to.equal(results[0].snippet.deepResults[0].links.length);
    });

    context('each button', function () {
      it('renders with correct text', function () {
        const $allButtons = $result.querySelectorAll(buttonSelector);

        expect($allButtons.length).to.be.above(0);
        [...$allButtons].forEach(function ($button, i) {
          expect($button).to.contain.text(results[0].snippet.deepResults[0].links[i].title);
        });
      });

      it('renders with correct URL', function () {
        const $allButtons = $result.querySelectorAll(buttonSelector);

        expect($allButtons.length).to.be.above(0);
        [...$allButtons].forEach(function ($button, i) {
          expect($button.href).to.exist;
          expect($button.href).to.contain(results[0].snippet.deepResults[0].links[i].url);
        });
      });
    });
  });
}

/** Check if the adult question buttons have been rendered
  * @param {object} $result - dropdown element
  * @param {boolean} areButtonsPresent - defines if testing presense
      or absence of adult question buttons
*/
export function checkAdultButtons({ $result, areButtonsPresent = true }) {
  const buttonsAreaSelector = '.buttons';
  const adultBtnSelector = 'a.btn';

  if (areButtonsPresent) {
    context('renders adult question buttons', function () {
      it('successfully', function () {
        const $buttonsArea = $result
          .querySelector(`${mainResultSelector} ${buttonsAreaSelector}`);
        expect($buttonsArea).to.exist;
      });

      it('in correct amount', function () {
        const $allLocationBtns = $result
          .querySelectorAll(`${mainResultSelector} ${buttonsAreaSelector} ${adultBtnSelector}`);
        expect($allLocationBtns.length).to.equal(3);
      });

      it('with correct text', function () {
        const $allLocationBtns = $result
          .querySelectorAll(`${mainResultSelector} ${buttonsAreaSelector} ${adultBtnSelector}`);
        const showOnceText = getLocalisedString().show_once.message;
        const alwaysText = getLocalisedString().always.message;
        const neverText = getLocalisedString().never.message;

        expect($allLocationBtns[0].textContent.trim()).to.be.equal(showOnceText);
        expect($allLocationBtns[1].textContent.trim()).to.be.equal(alwaysText);
        expect($allLocationBtns[2].textContent.trim()).to.be.equal(neverText);
      });
    });
  } else {
    it('does not render adult question', function () {
      const $buttonsArea = $result
        .querySelector(`${mainResultSelector} ${buttonsAreaSelector}`);
      expect($buttonsArea).to.not.exist;
    });
  }
}

/** Check if the location buttons have been rendered
  * @param {object} $result - dropdown element
  * @param {boolean} areButtonsPresent - defines if testing presense
      or absence of location buttons
  * @param {string} scType - type of smart cliqz, required to return correct buttons text
*/
export function checkLocationButtons({ $result, areButtonsPresent = true, scType = 'cinema' }) {
  const locale = CliqzUtils.locale.default || CliqzUtils.locale[window.navigator.language];
  const locationAreaSelector = '.location';
  const locationBtnSelector = 'a.btn';
  const allowOnceBtnSelector = '.location-allow-once';
  const alwaysShowBtnSelector = '.location-always-show';

  if (areButtonsPresent) {
    context('renders location buttons', function () {
      it('successfully', function () {
        const $locationArea = $result
          .querySelector(`${mainResultSelector} ${locationAreaSelector}`);
        expect($locationArea).to.exist;
      });

      it('in correct amount', function () {
        const $allLocationBtns = $result
          .querySelectorAll(`${mainResultSelector} ${locationAreaSelector} ${locationBtnSelector}`);
        expect($allLocationBtns.length).to.equal(2);
      });

      it('with correct text', function () {
        const $allowOnceBtn = $result
          .querySelectorAll(`${mainResultSelector} ${locationAreaSelector} ${allowOnceBtnSelector}`);
        const $allowAlwaysBtn = $result
          .querySelectorAll(`${mainResultSelector} ${locationAreaSelector} ${alwaysShowBtnSelector}`);

        if (scType === 'cinema') {
          expect($allowOnceBtn)
            .to.contain.text(locale.cinema_show_location_and_contact.message);
          expect($allowAlwaysBtn)
            .to.contain.text(locale.cinema_always_show_location.message);
        } else if (scType === 'local') {
          expect($allowOnceBtn)
            .to.contain.text(locale.show_location_and_contact.message);
          expect($allowAlwaysBtn)
            .to.contain.text(locale.always_show_location.message);
        }
      });
    });
  } else {
    it('does not render location question', function () {
      const $locationArea = $result
        .querySelector(`${mainResultSelector} ${locationAreaSelector}`);
      expect($locationArea).to.be.empty;
    });
  }
}

/** Check if the map has been rendered
  * @param {object} $result - dropdown element
  * @param {object} results - mocked backend response
  * $param {booleab} isDistanceShown - defines if testing presense
      or absence of distance element
  * @param {string} scType - type of smart cliqz, required to return correct buttons text
*/
export function checkMap({ $result, results, isDistanceShown = true, scType = 'cinema' }) {
  const mapAreaSelector = '.local-result-wrapper';
  const mapIconSelector = 'a.local-map';
  const mapContactSelector = '.local-info';
  const mapAddressSelector = '.address';
  const mapDistanceSelector = '.distance';
  const mapPhoneSelector = '.local-phone';

  context('renders map area', function () {
    it('successfully', function () {
      const $mapArea = $result.querySelector(`${mainResultSelector} ${mapAreaSelector}`);
      expect($mapArea).to.exist;
    });

    it('with an existing map icon with an URL', function () {
      const $mapIcon = $result.querySelector(`${mainResultSelector} ${mapAreaSelector} ${mapIconSelector}`);
      expect($mapIcon).to.exist;
      expect($mapIcon.href).to.exist;
    });

    it('with existing and correct contact data', function () {
      const $mapContact = $result
        .querySelector(`${mainResultSelector} ${mapAreaSelector} ${mapContactSelector}`);
      const $mapAddress = $result
        .querySelector(`${mainResultSelector} ${mapAreaSelector} ${mapContactSelector} ${mapAddressSelector}`);
      const $mapDistance = $result
        .querySelector(`${mainResultSelector} ${mapAreaSelector} ${mapContactSelector} ${mapDistanceSelector}`);
      const $mapPhone = $result
        .querySelector(`${mainResultSelector} ${mapAreaSelector} ${mapContactSelector} ${mapPhoneSelector}`);

      expect($mapContact).to.exist;
      expect($mapAddress).to.exist;
      if (isDistanceShown) {
        expect($mapDistance).to.exist;
      } else {
        expect($mapDistance).to.not.exist;
      }
      expect($mapPhone).to.exist;

      let resultsText;
      if (scType === 'cinema') {
        resultsText = results[0].snippet.extra.data.cinema;
      } else if (scType === 'local') {
        resultsText = results[0].snippet.extra;
      }

      expect($mapAddress).to.contain.text(resultsText.address);
      expect($mapPhone).to.contain.text(resultsText.phonenumber);
    });
  });
}

/** Check if the parent element has been rendered
* @param {object} $result - dropdown element
* @param {object} results - mocked backend response
*/
export function checkParent({ $result, results }) {
  const parentSelector = 'a.result';
  const parentTitleSelector = '.abstract .title';
  const parentDomainSelector = '.abstract .url';
  const parentDescriptionSelector = '.abstract .description';
  const parentIconSelector = '.icons .logo';

  context('renders parent result', function () {
    it('successfully', function () {
      const $parent = $result.querySelector(`${mainResultSelector} ${parentSelector}`);
      expect($parent).to.exist;
    });

    it('with an existing and correct title', function () {
      const $parentTitle = $result
        .querySelector(`${mainResultSelector} ${parentSelector} ${parentTitleSelector}`);
      expect($parentTitle).to.exist;
      expect($parentTitle).to.have.text(results[0].snippet.title);
    });

    it('with an existing and correct domain', function () {
      const $parentDomain = $result
        .querySelector(`${mainResultSelector} ${parentSelector} ${parentDomainSelector}`);
      expect($parentDomain).to.exist;
      expect($parentDomain).to.have.text(results[0].snippet.friendlyUrl);
    });

    it('with an existing and correct URL', function () {
      const $parent = $result.querySelector(`${mainResultSelector} ${parentSelector}`);
      expect($parent.href).to.exist;
      expect($parent.href).to.equal(results[0].url);
    });

    it('with an existing and correct description', function () {
      const $parentDescription = $result
        .querySelector(`${mainResultSelector} ${parentSelector} ${parentDescriptionSelector}`);
      expect($parentDescription).to.exist;
      expect($parentDescription).to.have.text(results[0].snippet.description);
    });

    it('with an existing icon', function () {
      const $parentIcon = $result
        .querySelector(`${mainResultSelector} ${parentSelector} ${parentIconSelector}`);
      expect($parentIcon).to.exist;
    });
  });
}

/** Check if the parent element has been rendered
* @param {object} $result - dropdown element
* @param {object} amuntOfRowns - amount of expected lotto result rows
*/
export function checkLotto({ $result, amountOfRows }) {
  describe('renders winning results block', function () {
    const lottoResultSelector = '.lotto';
    const headerSelector = '.lotto-date';
    const disclaimerSelector = '.no-guarantee';
    const rowSelector = '.row';

    it('successfully', function () {
      const $lottoResult = $result.querySelector(`${mainResultSelector} ${lottoResultSelector}`);
      expect($lottoResult).to.exist;
    });

    it('with a correct header', function () {
      const $header = $result
        .querySelector(`${mainResultSelector} ${lottoResultSelector} ${headerSelector}`);

      expect($header).to.exist;
      expect($header).to.contain.text(getLocalisedString().lotto_gewinnzahlen.message);
      expect($header).to.contain.text('Mittwoch');
      expect($header).to.contain.text('19.7.2017');
    });

    it('with a correct disclaimer', function () {
      const $disclaimer = $result
        .querySelector(`${mainResultSelector} ${lottoResultSelector} ${disclaimerSelector}`);

      expect($disclaimer).to.exist;
      expect($disclaimer).to.have.text(getLocalisedString().no_guarantee.message);
    });

    it('with correct amount of results blocks', function () {
      const $allLottoRows = $result
        .querySelectorAll(`${mainResultSelector} ${lottoResultSelector} ${rowSelector}`);

      expect($allLottoRows.length).to.equal(amountOfRows);
    });
  });
}

export function checkChildren({ $result, results, parentSelector, youtube = false }) {
  const childSelector = '.result';
  const imageSelector = '.thumbnail img';
  const titleSelector = '.abstract .title';
  const domainSelector = '.abstract .url';
  const ageSelector = '.abstract .published-at';
  let descriptionSelector = '.description';
  const viewCountSelector = '.video-views';
  const durationSelector = '.duration';

  describe('renders all childen results', function () {
    it('successfully', function () {
      const $childrenArea = $result
        .querySelector(`${mainResultSelector} ${parentSelector}`);
      const $allChildrenElements = $result
        .querySelectorAll(`${mainResultSelector} ${parentSelector} ${childSelector}`);

      expect($childrenArea).to.exist;
      expect($allChildrenElements.length).to.be.above(0);
    });

    it('with correct images', function () {
      const $allChildrenElements = $result
        .querySelectorAll(`${mainResultSelector} ${parentSelector} ${childSelector}`);

      expect($allChildrenElements.length).to.be.above(0);
      [...$allChildrenElements].forEach(function ($child, i) {
        const $childImage = $child.querySelector(imageSelector);

        expect($childImage).to.exist;
        expect($childImage.src).to.exist;
        if (youtube) {
          expect($childImage.src)
            .to.equal(results[0].snippet.deepResults[1].links[i].extra.thumbnail);
        } else {
          expect($childImage.src).to.equal(results[0].snippet.deepResults[1].links[i].extra.media);
        }
      });
    });

    it('with correct titles', function () {
      const $allChildrenElements = $result
        .querySelectorAll(`${mainResultSelector} ${parentSelector} ${childSelector}`);

      expect($allChildrenElements.length).to.be.above(0);
      [...$allChildrenElements].forEach(function ($child, i) {
        const $childTitle = $child.querySelector(titleSelector);

        expect($childTitle).to.exist;
        expect($childTitle).to.have.text(results[0].snippet.deepResults[1].links[i].title);
      });
    });

    if (!youtube) {
      it('with correct domains', function () {
        const $allChildrenElements = $result
          .querySelectorAll(`${mainResultSelector} ${parentSelector} ${childSelector}`);

        expect($allChildrenElements.length).to.be.above(0);
        [...$allChildrenElements].forEach(function ($child, i) {
          const $childDomain = $child.querySelector(domainSelector);

          expect($childDomain).to.exist;
          expect($childDomain)
            .to.have.text(results[0].snippet.deepResults[1].links[i].extra.domain);
        });
      });
    }

    it('with correct URLs', function () {
      const $allChildrenElements = $result
        .querySelectorAll(`${mainResultSelector} ${parentSelector} ${childSelector}`);

      expect($allChildrenElements.length).to.be.above(0);
      [...$allChildrenElements].forEach(function ($child, i) {
        expect($child.href).to.exist;
        expect($child.href).to.equal(results[0].snippet.deepResults[1].links[i].url);
      });
    });

    if (!youtube) {
      it('with existing ages', function () {
        const $allChildrenElements = $result
          .querySelectorAll(`${mainResultSelector} ${parentSelector} ${childSelector}`);

        expect($allChildrenElements.length).to.be.above(0);
        [...$allChildrenElements].forEach(function ($child) {
          const $childAge = $child.querySelector(ageSelector);
          expect($childAge).to.exist;
        });
      });
    }

    it('with existing and correct descriptions', function () {
      if (youtube) {
        descriptionSelector = viewCountSelector;
      }

      const $allChildrenElements = $result
        .querySelectorAll(`${mainResultSelector} ${parentSelector} ${childSelector}`);

      expect($allChildrenElements.length).to.be.above(0);
      [...$allChildrenElements].forEach(function ($child, i) {
        const $childDescription = $child.querySelector(descriptionSelector);

        expect($childDescription).to.exist;

        if (youtube) {
          expect($childDescription)
            .to.contain.text(results[0].snippet.deepResults[1].links[i].extra.views);
        } else {
          expect($childDescription).to.have.text(results[0]
            .snippet.deepResults[1].links[i].extra.description);
        }
      });
    });

    if (youtube) {
      it('with an existing duration time', function () {
        const $allChildrenElements = $result
          .querySelectorAll(`${mainResultSelector} ${parentSelector} ${childSelector}`);

        expect($allChildrenElements.length).to.be.above(0);
        [...$allChildrenElements].forEach(function ($child) {
          const $childDuration = $child.querySelector(durationSelector);
          expect($childDuration).to.exist;
        });
      });
    }
  });
}

/** Check if the table containing movie showings has been rendered
  * @param {object} $result - dropdown element
  * @param {object} results - mocked backend response
  * @param {boolean} isExpanded - defines if testing:
    * presence or absence of the "Show more" button,
    * hardcoded amount of table rows (2) or all rows coming from results
  * @param {number} activeTabIdx - index of currently selected day tab
*/
export function checkTableOfShowings({ $result, results, isExpanded = false, activeTabIdx = 0 }) {
  const locale = CliqzUtils.locale.default || CliqzUtils.locale[window.navigator.language];
  const showtimeAreaSelector = '.show-time';
  const showtimeTitleSelector = '.showtime-title';
  const showtimeHeaderSelector = '.showtime-cinema-header';
  const showtimeIconSelector = '.location-icon';
  const showtimeCitySelector = '.showtime-city';

  const showtimeTabsSelector = '.dropdown-tab';
  const showtimeActiveTabSelector = `#tab-block-${activeTabIdx}`;
  const showtimeTableRowSelector = '.show-time-row';
  const showtimeMovieTitleSelector = '.movie-title';
  const showtimeMovieTimeSelector = '.show-time-span a.result';
  const showtimeMovieLangSelector = '.movie-language';
  const showtimeMovie3dSelector = 'movie-3d';
  const showMoreBtnSelector = '.expand-btn';

  context('renders showings table', function () {
    it('succesfully', function () {
      const $showtimeArea = $result
        .querySelector(`${mainResultSelector} ${showtimeAreaSelector}`);
      expect($showtimeArea).to.exist;
    });

    it('with an existing and correct header', function () {
      const $showtimeTitle = $result
        .querySelector(`${mainResultSelector} ${showtimeTitleSelector}`);
      const $showtimeHeader = $result
        .querySelector(`${mainResultSelector} ${showtimeHeaderSelector}`);
      const $showtimeIcon = $result
        .querySelector(`${mainResultSelector} ${showtimeIconSelector}`);
      const $showtimeCity = $result
        .querySelector(`${mainResultSelector} ${showtimeCitySelector}`);

      expect($showtimeTitle).to.exist;
      expect($showtimeHeader).to.exist;
      expect($showtimeHeader).to.contain.text(results[0].snippet.extra.data.cinema.name);
      expect($showtimeIcon).to.exist;
      expect(getComputedStyle($showtimeIcon).backgroundImage)
        .to.contain('location-icon.svg');
      expect($showtimeCity).to.exist;
      expect($showtimeCity).to.contain.text(results[0].snippet.extra.data.city);
    });

    it('with existing and correct table tabs', function () {
      const $allShowTimeTabs = $result
        .querySelectorAll(`${mainResultSelector} ${showtimeTabsSelector}`);

      expect($allShowTimeTabs.length).to.be.above(0);
      expect($allShowTimeTabs.length)
        .to.equal(results[0].snippet.extra.data.showdates.length);
      [...$allShowTimeTabs].forEach(function (tab, i) {
        expect(tab).to.have.text(results[0].snippet.extra.data.showdates[i].date);
      });
    });

    it(`with tab #${activeTabIdx} being selected as default`, function () {
      const $allShowTimeTabs = $result
        .querySelectorAll(`${mainResultSelector} ${showtimeTabsSelector}`);

      expect($allShowTimeTabs.length).to.be.above(0);
      [...$allShowTimeTabs].forEach(function ($tab) {
        if ($tab.id === `tab-${activeTabIdx}`) {
          expect($tab.classList.contains('checked')).to.be.true;
        } else {
          expect($tab.classList.contains('checked')).to.not.be.true;
        }
      });
    });

    it('with correct amount of movies rows', function () {
      let amountOfRows;

      if (isExpanded) {
        amountOfRows = results[0].snippet.extra.data.showdates[0].movie_list.length;
      } else {
        amountOfRows = 2;
      }
      const $allMovies = $result
        .querySelectorAll(`${mainResultSelector} ${showtimeActiveTabSelector} ${showtimeTableRowSelector}`);

      expect($allMovies.length).to.equal(amountOfRows);
    });

    it('with correct data in each movie row', function () {
      const $allMovies = $result
        .querySelectorAll(`${mainResultSelector} ${showtimeActiveTabSelector} ${showtimeTableRowSelector}`);

      expect($allMovies.length).to.be.above(0);
      [...$allMovies].forEach(function ($row, i) {
        const $movieTitle = $row.querySelector(showtimeMovieTitleSelector);
        const $allMovieTimes = $row.querySelectorAll(showtimeMovieTimeSelector);

        expect($movieTitle).to.contain.text(
          results[0].snippet.extra.data.showdates[activeTabIdx].movie_list[i].title
        );
        expect($allMovieTimes.length).to.equal(
          results[0].snippet.extra.data.showdates[activeTabIdx].movie_list[i].showtimes.length
        );

        [...$allMovieTimes].forEach(function ($time, j) {
          const $movieLang = $time.querySelector(showtimeMovieLangSelector);
          const $movie3d = $time.querySelector(showtimeMovie3dSelector);

          expect($time.href).to.exist;
          expect($time.href).to.equal(
            results[0].snippet.extra.data.showdates[activeTabIdx]
              .movie_list[i].showtimes[j].booking_link
          );

          expect($movieLang).to.exist;
          expect($movieLang).to.contain.text(
            results[0].snippet.extra.data.showdates[activeTabIdx]
              .movie_list[i].showtimes[j].language
          );

          if (results[0].snippet.extra.data.showdates[activeTabIdx].movie_list[i].showtimes[j].is_3d === 'true') {
            expect($movie3d).to.exist;
            expect($movie3d).to.contain.text('3d');
          } else {
            expect($movie3d).to.not.exist;
          }
        });
      });
    });

    if (isExpanded) {
      it('without "Show more" item', function () {
        const $showMoreButton = $result
          .querySelector(`${mainResultSelector} ${showMoreBtnSelector}`);
        expect($showMoreButton).to.not.exist;
      });
    } else {
      it('with an existing and correct "Show more" item', function () {
        const $showMoreButton = $result
          .querySelector(`${mainResultSelector} ${showMoreBtnSelector}`);
        expect($showMoreButton).to.exist;
        expect($showMoreButton).to.have.trimmed.text(locale.general_expand_button.message);
        expect($showMoreButton.dataset.url).to.exist;
      });
    }
  });
}

/** Check if the table containing cinemas has been rendered
  * @param {object} $result - dropdown element
  * @param {object} results - mocked backend response
  * @param {boolean} isExpanded - defines if testing:
    * presence or absence of the "Show more" button,
    * hardcoded amount of table rows (2) or all rows coming from results
  * @param {number} activeTabIdx - index of currently selected day tab
*/
export function checkTableOfCinemas({ $result, results, isExpanded = false, activeTabIdx = 0 }) {
  const locale = CliqzUtils.locale.default || CliqzUtils.locale[window.navigator.language];
  const showtimeAreaSelector = '.show-time';
  const showtimeTitleSelector = '.showtime-title';
  const showtimeHeaderSelector = '.showtime-cinema-header';
  const showtimeIconSelector = '.location-icon';
  const showtimeCitySelector = '.showtime-city';

  const showtimeTabsSelector = '.dropdown-tab';
  const showtimeActiveTabSelector = `#tab-block-${activeTabIdx}`;
  const showtimeTableRowSelector = '.show-time-row';
  const showtimeCinemaNameSelector = '.showtime-cinema-name';
  const showtimeCinemaAddressSelector = '.showtime-cinema-address';
  const showtimeMovieTimeSelector = '.show-time-span a.result';
  const showtimeMovieLangSelector = '.movie-language';
  const showtimeMovie3dSelector = 'movie-3d';
  const showMoreBtnSelector = '.expand-btn';

  context('renders showings table', function () {
    it('succesfully', function () {
      const $showtimeArea = $result
        .querySelector(`${mainResultSelector} ${showtimeAreaSelector}`);
      expect($showtimeArea).to.exist;
    });

    it('with an existing and correct header', function () {
      const $showtimeTitle = $result
        .querySelector(`${mainResultSelector} ${showtimeTitleSelector}`);
      const $showtimeHeader = $result
        .querySelector(`${mainResultSelector} ${showtimeHeaderSelector}`);
      const $showtimeIcon = $result
        .querySelector(`${mainResultSelector} ${showtimeIconSelector}`);
      const $showtimeCity = $result
        .querySelector(`${mainResultSelector} ${showtimeCitySelector}`);

      expect($showtimeTitle).to.exist;
      expect($showtimeHeader).to.exist;
      expect($showtimeHeader).to.contain.text(locale.cinema_movie_showtimes.message);
      expect($showtimeHeader).to.contain.text(results[0].snippet.extra.data.title);
      expect($showtimeIcon).to.exist;
      expect(getComputedStyle($showtimeIcon).backgroundImage)
        .to.contain('location-icon.svg');
      expect($showtimeCity).to.exist;
      expect($showtimeCity).to.contain.text(results[0].snippet.extra.data.city);
    });

    it('with existing and correct table tabs', function () {
      const $allShowTimeTabs = $result
        .querySelectorAll(`${mainResultSelector} ${showtimeTabsSelector}`);

      expect($allShowTimeTabs.length).to.be.above(0);
      expect($allShowTimeTabs.length)
        .to.equal(results[0].snippet.extra.data.showdates.length);
      [...$allShowTimeTabs].forEach(function (tab, i) {
        expect(tab).to.have.text(results[0].snippet.extra.data.showdates[i].date);
      });
    });

    it(`with tab #${activeTabIdx} being selected as default`, function () {
      const $allShowTimeTabs = $result
        .querySelectorAll(`${mainResultSelector} ${showtimeTabsSelector}`);

      expect($allShowTimeTabs.length).to.be.above(0);
      [...$allShowTimeTabs].forEach(function ($tab) {
        if ($tab.id === `tab-${activeTabIdx}`) {
          expect($tab.classList.contains('checked')).to.be.true;
        } else {
          expect($tab.classList.contains('checked')).to.not.be.true;
        }
      });
    });

    it('with correct amount of cinemas rows', function () {
      let amountOfRows;

      if (isExpanded) {
        amountOfRows = results[0].snippet.extra.data.showdates[activeTabIdx].cinema_list.length;
      } else {
        amountOfRows = 2;
      }

      const $allCinemas = $result
        .querySelectorAll(`${mainResultSelector} ${showtimeActiveTabSelector} ${showtimeTableRowSelector}`);
      expect($allCinemas.length).to.equal(amountOfRows);
    });

    it('with correct data in each cinema row', function () {
      const $allCinemas = $result
        .querySelectorAll(`${mainResultSelector} ${showtimeActiveTabSelector} ${showtimeTableRowSelector}`);

      expect($allCinemas.length).to.be.above(0);
      [...$allCinemas].forEach(function ($row, i) {
        const $cinemaName = $row.querySelector(showtimeCinemaNameSelector);
        const $cinemaAddress = $row.querySelector(showtimeCinemaAddressSelector);
        const $allMovieTimes = $row.querySelectorAll(showtimeMovieTimeSelector);

        expect($cinemaName).to.contain.text(
          results[0].snippet.extra.data.showdates[activeTabIdx].cinema_list[i].name
        );
        expect($cinemaAddress).to.contain.text(
          results[0].snippet.extra.data.showdates[activeTabIdx].cinema_list[i].address
        );
        expect($allMovieTimes.length).to.equal(
          results[0].snippet.extra.data.showdates[activeTabIdx].cinema_list[i].showtimes.length
        );

        [...$allMovieTimes].forEach(function ($time, j) {
          const $movieLang = $time.querySelector(showtimeMovieLangSelector);
          const $movie3d = $time.querySelector(showtimeMovie3dSelector);

          expect($time.href).to.exist;
          expect($time.href).to.equal(
            results[0].snippet.extra.data.showdates[activeTabIdx]
              .cinema_list[i].showtimes[j].booking_link
          );

          expect($movieLang).to.exist;
          expect($movieLang).to.contain.text(
            results[0].snippet.extra.data.showdates[activeTabIdx]
              .cinema_list[i].showtimes[j].language
          );

          if (results[0].snippet.extra.data.showdates[activeTabIdx].cinema_list[i].showtimes[j].is_3d === 'true') {
            expect($movie3d).to.exist;
            expect($movie3d).to.contain.text('3d');
          } else {
            expect($movie3d).to.not.exist;
          }
        });
      });
    });

    if (isExpanded) {
      it('without "Show more" item', function () {
        const $showMoreButton = $result
          .querySelector(`${mainResultSelector} ${showMoreBtnSelector}`);
        expect($showMoreButton).to.not.exist;
      });
    } else {
      it('with an existing and correct "Show more" item', function () {
        const $showMoreButton = $result
          .querySelector(`${mainResultSelector} ${showMoreBtnSelector}`);
        expect($showMoreButton).to.exist;
        expect($showMoreButton).to.have.trimmed.text(locale.general_expand_button.message);
        expect($showMoreButton.dataset.url).to.exist;
      });
    }
  });
}
