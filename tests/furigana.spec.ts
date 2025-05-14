import { test, expect } from '@playwright/test';

test.describe('Furigana functionality', () => {
  test('should display furigana for kanji in translated text', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8081');
    
    // Wait for the app to load fully
    await page.waitForSelector('text=Translate');
    
    // Find and clear the input field
    const inputField = page.locator('input[placeholder="Enter English text..."]');
    await inputField.click();
    await inputField.clear();
    
    // Type "village" in the input field
    await inputField.type('village');
    
    // Click the translate button
    await page.locator('button[aria-label="Translate text"]').click();
    
    // Wait for translation to appear
    await page.waitForTimeout(1000); // Wait for translation to complete
    
    // Verify that the kanji "村" is present
    await expect(page.locator('text="村"')).toBeVisible();
    
    // Verify the ruby element structure
    const rubyElement = page.locator('ruby');
    await expect(rubyElement).toBeVisible();
    
    // Check that the ruby element contains the proper kanji and reading
    const rubyHTML = await rubyElement.evaluate(node => node.outerHTML);
    
    // Log the HTML for debugging
    console.log('Ruby HTML:', rubyHTML);
    
    // Verify that the ruby element contains the kanji "村"
    expect(rubyHTML).toContain('村');
    
    // Verify that the rt element contains the reading "むら"
    expect(rubyHTML).toContain('<rt');
    expect(rubyHTML).toContain('むら');
    
    // Test another word with kanji - "culture"
    await inputField.click();
    await inputField.clear();
    await inputField.type('culture');
    await page.locator('button[aria-label="Translate text"]').click();
    
    // Wait for translation to appear
    await page.waitForTimeout(1000);
    
    // Verify that the kanji "文化" is present
    await expect(page.locator('text="文化"')).toBeVisible();
    
    // Verify multiple ruby elements for compound kanji
    const rubyElements = page.locator('ruby');
    const count = await rubyElements.count();
    expect(count).toBeGreaterThanOrEqual(2); // Should have at least 2 ruby elements for 文化
    
    // Check the content of each ruby element
    const firstRubyHTML = await rubyElements.nth(0).evaluate(node => node.outerHTML);
    const secondRubyHTML = await rubyElements.nth(1).evaluate(node => node.outerHTML);
    
    console.log('First Ruby HTML:', firstRubyHTML);
    console.log('Second Ruby HTML:', secondRubyHTML);
    
    // Verify first kanji and reading
    expect(firstRubyHTML).toContain('文');
    expect(firstRubyHTML).toContain('ぶん');
    
    // Verify second kanji and reading
    expect(secondRubyHTML).toContain('化');
    expect(secondRubyHTML).toContain('か');
  });
  
  test('should display furigana for villain and other complex words', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8081');
    
    // Wait for the app to load fully
    await page.waitForSelector('text=Translate');
    
    // Test words with kanji that need furigana
    const complexWords = ['villain', 'hero', 'school', 'teacher'];
    
    for (const word of complexWords) {
      // Find and clear the input field
      const inputField = page.locator('input[placeholder="Enter English text..."]');
      await inputField.click();
      await inputField.clear();
      
      // Type the test word
      await inputField.type(word);
      
      // Click the translate button
      await page.locator('button[aria-label="Translate text"]').click();
      
      // Wait for translation to appear
      await page.waitForTimeout(1000);
      
      // Verify the ruby elements are present
      const rubyElements = page.locator('ruby');
      await expect(rubyElements.first()).toBeVisible();
      
      // Validate that furigana readings are present in rt elements
      const rtElements = page.locator('rt');
      await expect(rtElements.first()).toBeVisible();
      
      console.log(`Verified furigana for "${word}"`);
    }
  });
  
  test('should display furigana consistently across translations', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8081');
    
    // Wait for the app to load fully
    await page.waitForSelector('text=Translate');
    
    // Test words from our translation service with kanji
    const wordsToTest = ['japan', 'train', 'water', 'new', 'dictionary'];
    
    // Define expected kanji and readings for validation
    const expectedResults = {
      'japan': { kanji: ['日', '本'], readings: ['に', 'ほん'] },
      'train': { kanji: ['電', '車'], readings: ['でん', 'しゃ'] },
      'water': { kanji: ['水'], readings: ['みず'] },
      'new': { kanji: ['新'], readings: ['あたら'] },
      'dictionary': { kanji: ['辞', '書'], readings: ['じ', 'しょ'] }
    };
    
    for (const word of wordsToTest) {
      // Find and clear the input field
      const inputField = page.locator('input[placeholder="Enter English text..."]');
      await inputField.click();
      await inputField.clear();
      
      // Type the test word
      await inputField.type(word);
      
      // Click the translate button
      await page.locator('button[aria-label="Translate text"]').click();
      
      // Wait for translation to appear
      await page.waitForTimeout(1000);
      
      // Get all ruby elements
      const rubyElements = page.locator('ruby');
      const count = await rubyElements.count();
      
      // Check that we have the expected number of ruby elements
      expect(count).toBeGreaterThanOrEqual(expectedResults[word].kanji.length);
      
      // Check each kanji and its reading
      for (let i = 0; i < expectedResults[word].kanji.length; i++) {
        const rubyHTML = await rubyElements.nth(i).evaluate(node => node.outerHTML);
        
        // Verify kanji
        expect(rubyHTML).toContain(expectedResults[word].kanji[i]);
        
        // Verify reading
        expect(rubyHTML).toContain(expectedResults[word].readings[i]);
      }
      
      console.log(`Verified furigana for "${word}"`);
    }
  });
});