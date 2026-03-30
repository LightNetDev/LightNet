import { expect, type Locator, type Page } from "@playwright/test"

class EditorField {
  constructor(
    protected readonly page: Page,
    protected readonly locator: Locator,
  ) {}

  async expectVisible() {
    await expect(this.locator).toBeVisible()
  }

  async expectHidden() {
    await expect(this.locator).toBeHidden()
  }

  async text() {
    return (await this.locator.innerText()).replace(/\s+/g, " ").trim()
  }

  async expectValidationMessage(message: string) {
    const invalidIndicator = this.locator.locator(
      '[aria-invalid="true"], [role="alert"]',
    )

    if ((await invalidIndicator.count()) > 0) {
      await expect(invalidIndicator.first()).toBeVisible()
    }

    const fieldText = await this.text()

    if (fieldText.includes(message)) {
      return
    }

    await expect(
      this.page.getByText(message, { exact: false }).first(),
    ).toBeVisible()
  }

  private menuButton() {
    const namedButton = this.locator
      .getByRole("button", { name: /show edit options|edit options/i })
      .first()

    return namedButton.or(
      this.locator.locator('button[aria-haspopup="menu"]').first(),
    )
  }

  async openMenu() {
    await this.locator.scrollIntoViewIfNeeded()
    await this.menuButton().click()
  }

  async revertChanges() {
    await this.openMenu()
    await this.page.getByRole("menuitem", { name: /revert changes/i }).click()
  }
}

class StringField extends EditorField {
  private editableControl() {
    return this.locator
      .locator(
        'input:not([type="checkbox"]):not([type="file"]):not([type="hidden"]):not([type="radio"]), textarea, [contenteditable="true"]',
      )
      .first()
  }

  async fill(value: string) {
    await this.locator.scrollIntoViewIfNeeded()
    await expect(this.locator).toBeVisible()
    await this.editableControl().fill(value)
  }

  async clear() {
    await this.fill("")
  }
}

class RelationField extends EditorField {
  async selectOption(optionLabel: string) {
    await this.locator.scrollIntoViewIfNeeded()
    await this.locator.getByText(optionLabel, { exact: true }).click()
  }
}

class ComboboxField extends EditorField {
  async selectOption(optionLabel: string) {
    await this.locator.scrollIntoViewIfNeeded()
    await this.locator.click()
    await this.page
      .getByRole("option", { name: optionLabel, exact: true })
      .click()
  }

  async text() {
    return this.locator.innerText()
  }
}

class ListField extends EditorField {
  async addItem(itemTypeLabel?: string) {
    await this.locator.scrollIntoViewIfNeeded()
    await this.locator.getByRole("button", { name: /Add / }).first().click()

    if (!itemTypeLabel) {
      return
    }

    const menuItem = this.page.getByRole("menuitem", {
      name: itemTypeLabel,
      exact: true,
    })

    if ((await menuItem.count()) > 0) {
      await menuItem.first().click()
      return
    }

    await this.page.getByText(itemTypeLabel, { exact: true }).first().click()
  }

  async getItemTextYPosition(text: string) {
    const item = this.page.getByText(text, { exact: true }).first()
    await expect(item).toBeVisible()
    const box = await item.boundingBox()
    return box?.y ?? Number.POSITIVE_INFINITY
  }

  async removeItemByText(text: string) {
    const item = this.locator.getByText(text, { exact: true }).first()
    await expect(item).toBeVisible()

    const removeButton = item
      .locator("xpath=ancestor::*[.//button][1]")
      .getByRole("button", { name: /remove/i })
      .first()

    await removeButton.click()
  }
}

class TypedObjectField extends ListField {
  async addTypedItem(typeLabel: string) {
    await this.addItem(typeLabel)
  }
}

class FileField extends EditorField {
  async uploadFile(filePath: string) {
    await this.locator.scrollIntoViewIfNeeded()
    await this.locator
      .locator('input[type="file"]')
      .first()
      .setInputFiles(filePath)
  }

  async expectUploadShellVisible() {
    await expect(this.locator.getByText(/Drop a file here or/)).toBeVisible()
  }

  private browseButton() {
    return this.locator.getByRole("button", { name: /browse|replace/i }).first()
  }

  private assetDialog() {
    return this.page.getByRole("dialog").last()
  }

  async openAssetBrowser() {
    await this.locator.scrollIntoViewIfNeeded()
    await this.browseButton().click()
    await expect(this.assetDialog()).toBeVisible()
  }

  async openFieldAssets() {
    const assetDialog = this.assetDialog()
    const locationOption = assetDialog
      .getByRole("option", { name: /field assets|collection assets/i })
      .first()

    if ((await locationOption.count()) > 0) {
      await locationOption.click()
      return
    }

    const locationControl = assetDialog
      .getByRole("combobox", { name: /locations/i })
      .first()

    if ((await locationControl.count()) > 0) {
      await locationControl.click()
      await this.page
        .getByRole("option", { name: /field assets|collection assets/i })
        .first()
        .click()
      return
    }

    await assetDialog
      .getByRole("button", { name: /field assets|collection assets/i })
      .first()
      .click()
  }

  expectAssetVisible(name: string) {
    return expect(
      this.assetDialog().getByText(name, { exact: true }).first(),
    ).toBeVisible()
  }
}

class EntryEditor {
  constructor(readonly page: Page) {}

  private keyPathSelector(keyPath: string) {
    return `section.field[data-key-path="${keyPath.replaceAll('"', '\\"')}"]`
  }

  private fieldLocatorByKeyPath(keyPath: string) {
    return this.page.locator(this.keyPathSelector(keyPath)).first()
  }

  private fieldLocatorByLabel(label: string) {
    return this.page
      .locator("section.field")
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .first()
  }

  getFieldByKeyPath(keyPath: string) {
    return new EditorField(this.page, this.fieldLocatorByKeyPath(keyPath))
  }

  getFieldByLabel(label: string) {
    return new EditorField(this.page, this.fieldLocatorByLabel(label))
  }

  getStringFieldByKeyPath(keyPath: string) {
    return new StringField(this.page, this.fieldLocatorByKeyPath(keyPath))
  }

  getStringFieldByLabel(label: string) {
    return new StringField(this.page, this.fieldLocatorByLabel(label))
  }

  getRelationFieldByLabel(label: string) {
    return new RelationField(this.page, this.fieldLocatorByLabel(label))
  }

  getRelationFieldByKeyPath(keyPath: string) {
    return new RelationField(this.page, this.fieldLocatorByKeyPath(keyPath))
  }

  getComboboxFieldByLabel(label: string, index = 0) {
    return new ComboboxField(
      this.page,
      this.page.getByRole("combobox", { name: label, exact: true }).nth(index),
    )
  }

  getListFieldByLabel(label: string) {
    return new ListField(this.page, this.fieldLocatorByLabel(label))
  }

  getListFieldByKeyPath(keyPath: string) {
    return new ListField(this.page, this.fieldLocatorByKeyPath(keyPath))
  }

  getTypedObjectFieldByLabel(label: string) {
    return new TypedObjectField(this.page, this.fieldLocatorByLabel(label))
  }

  getTypedObjectFieldByKeyPath(keyPath: string) {
    return new TypedObjectField(this.page, this.fieldLocatorByKeyPath(keyPath))
  }

  getFileFieldByLabel(label: string) {
    return new FileField(this.page, this.fieldLocatorByLabel(label))
  }

  getFileFieldByKeyPath(keyPath: string) {
    return new FileField(this.page, this.fieldLocatorByKeyPath(keyPath))
  }

  async attemptSave() {
    await this.page.getByRole("button", { name: "Save" }).click()
  }

  async save() {
    await this.attemptSave()
    await expect(
      this.page.getByRole("alert").filter({ hasText: "Entry has been saved." }),
    ).toBeVisible()
  }

  async cancel() {
    await this.page.getByRole("button", { name: /Cancel Editing/ }).click()
  }

  async expectFieldVisible(keyPath: string) {
    await this.getFieldByKeyPath(keyPath).expectVisible()
  }

  async expectFieldHidden(keyPath: string) {
    await this.getFieldByKeyPath(keyPath).expectHidden()
  }

  async expectUploadShellVisible(keyPath: string) {
    await this.getFileFieldByKeyPath(keyPath).expectUploadShellVisible()
  }

  async expectValidationError(keyPath: string, message?: string) {
    if (message) {
      await this.getFieldByKeyPath(keyPath).expectValidationMessage(message)
    }
  }

  async getFieldText(keyPath: string) {
    return this.getFieldByKeyPath(keyPath).text()
  }

  async getTextYPosition(text: string) {
    const locator = this.page.getByText(text, { exact: true }).first()
    await expect(locator).toBeVisible()
    const box = await locator.boundingBox()
    return box?.y ?? Number.POSITIVE_INFINITY
  }

  async expectTextVisible(pattern: RegExp | string) {
    await expect(this.page.getByText(pattern).first()).toBeVisible()
  }

  async expectTextNotVisible(pattern: RegExp | string) {
    await expect(this.page.getByText(pattern).first()).toBeHidden()
  }
}

export {
  ComboboxField,
  EditorField,
  EntryEditor,
  FileField,
  ListField,
  RelationField,
  StringField,
  TypedObjectField,
}
