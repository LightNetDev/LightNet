#!/usr/bin/env node
// @ts-check
/// <reference path="./types.d.ts" />

import fs from "node:fs/promises"
import path from "node:path"

import YAML from "yaml"

const translationsDirectory = "./node_modules/lightnet/src/i18n/translations"
const sourceFile = "en.yml"

const translationFiles = (await fs.readdir(translationsDirectory)).filter(
  (fileName) => fileName.endsWith(".yml"),
)

const sourceTranslations = await loadTranslationKeys(sourceFile)

/**
 * @type {ComparisonResult[]}
 */
const results = []
for (const translationFile of translationFiles) {
  results.push(await compareToSource(translationFile))
}

console.log(generateReport(results))

/**
 * @param {string} fileName
 * @returns {Promise<ComparisonResult>}
 */
async function compareToSource(fileName) {
  const translations = await loadTranslationKeys(fileName)
  const obsoleteKeys = difference(translations, sourceTranslations)
  const missingKeys = difference(sourceTranslations, translations)

  return {
    obsoleteKeys,
    missingKeys,
    fileName,
    bcp47: fileName.replace(".yml", ""),
    hasDifferences: !!obsoleteKeys.length || !!missingKeys.length,
  }
}

/**
 * @param {ComparisonResult[]} results
 */
function generateReport(results) {
  /**
   * @type {string[]}
   */
  const report = []
  report.push("# Translation status\n")
  report.push(
    "This report provides an overview of all built-in languages and the current progress of their translations.",
  )
  results.forEach((result) => {
    report.push(
      `\n## **${result.bcp47.toUpperCase()}** ([${result.fileName}](./${result.fileName}))`,
    )
    if (!result.hasDifferences) {
      report.push("\nAll keys have been translated. ✅")
    }
    if (result.missingKeys.length) {
      report.push("\nMissing keys:\n")
      result.missingKeys.forEach((key) => report.push(`- ${key}`))
    }
    if (result.obsoleteKeys.length) {
      report.push("\nObsolete keys:\n")
      result.obsoleteKeys.forEach((key) => report.push(`- ${key}`))
    }
  })
  return report.join("\n")
}

/**
 * @param {string} fileName
 * @returns {Promise<Set<string>>}
 */
async function loadTranslationKeys(fileName) {
  const yml = await fs.readFile(path.join(translationsDirectory, fileName), {
    encoding: "utf-8",
  })
  return new Set(Object.keys(YAML.parse(yml)))
}

/**
 * @param {Set<string>} source
 * @param {Set<string>} target
 * @return {string[]}
 */
function difference(source, target) {
  const diff = source
    .values()
    .filter((key) => !target.has(key))
    .filter((key) => !hasPluralVariant(key, target))
  return [...diff]
}

/**
 * @param {string} key
 * @param {Set<string>} target
 */
function hasPluralVariant(key, target) {
  const pluralSuffixes = ["_zero", "_one", "_two", "_few", "_many", "_other"]
  const pluralSuffix = pluralSuffixes.find((suffix) => key.endsWith(suffix))
  if (!pluralSuffix) {
    return false
  }
  // check if target contains any other plural variant of the same key
  const keyWithoutSuffix = key.slice(0, -pluralSuffix.length)
  const pluralVariant = pluralSuffixes
    .map((suffix) => keyWithoutSuffix + suffix)
    .find((variant) => target.has(variant))
  return !!pluralVariant
}
