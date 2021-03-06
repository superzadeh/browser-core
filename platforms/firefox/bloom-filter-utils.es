/* global FileUtils */
/* eslint-disable no-bitwise */
/* eslint-disable import/prefer-default-export */

import { BloomFilter } from './bloom-filter';
import { Components, Services } from './globals';

Components.utils.import('resource://gre/modules/FileUtils.jsm');

const HEAD_SIG = 0x43514246; // ASCII 'CQBF' - CliQz Bloom Filter
const FORMAT_VERSION = 1;
const FILE_MAX_SIZE = 20 * 1024 * 1024; // 20MB.
const ERRORS = {
  WRONG_FORMAT: 'Unrecognized filter data format',
  FILE_TOO_BIG: 'File is too big',
  BUFF_UNDERFLOW: 'Buffer underflow'
};

const iOService = Components.classes['@mozilla.org/network/io-service;1']
  .getService(Components.interfaces.nsIIOService);

function openFileInputStream(file) {
  const inStream = Components.classes['@mozilla.org/network/file-input-stream;1']
    .createInstance(Components.interfaces.nsIFileInputStream);
  inStream.init(file, FileUtils.MODE_RDONLY, 0, inStream.CLOSE_ON_EOF);
  return inStream;
}

function openUriInputStream(aURI) {
  const uri = iOService.newURI(aURI, null, null);
  const principal = Services.scriptSecurityManager.getSystemPrincipal();
  const aSecurityFlags = Components.interfaces.nsILoadInfo.SEC_ALLOW_CROSS_ORIGIN_DATA_IS_NULL;
  const aContentPolicyType = Components.interfaces.nsIContentPolicy.TYPE_OTHER;
  const channel = iOService.newChannelFromURI2(
    uri,
    null, // aLoadingNode
    principal,
    null, // aTriggeringPrincipal
    aSecurityFlags,
    aContentPolicyType
  );
  return channel.open2(); // Return input stream
}

export const BloomFilterUtils = {
  /**
   * @param aInput: {nsIFile} file or {nsIURI} uri - pointer to the bloom filter data file.
   * @return {BloomFilter, version} filter with a given file.
   */
  loadFromInput(aInput, aType) {
    let fStream = null;
    if (aType === 'uri') {
      fStream = openUriInputStream(aInput);
    } else { // aType === file
      fStream = openFileInputStream(aInput);
    }

    try {
      const binStream = Components.classes['@mozilla.org/binaryinputstream;1']
        .createInstance(Components.interfaces.nsIBinaryInputStream);
      binStream.setInputStream(fStream);
      if (binStream.available() > FILE_MAX_SIZE) {
        throw new Error(ERRORS.FILE_TOO_BIG);
      }

      // Check file header:
      const typeSig = binStream.read32();
      if (typeSig !== HEAD_SIG) {
        throw new Error(ERRORS.WRONG_FORMAT);
      }
      const version = binStream.read8();
      if (version !== FORMAT_VERSION) {
        throw new Error(ERRORS.WRONG_FORMAT);
      }
      const dbVersion = binStream.read16();
      const nHashes = binStream.read8();

      // Read the rest of it into a buffer:
      const buffer = new ArrayBuffer(binStream.available());
      const read = binStream.readArrayBuffer(buffer.byteLength, buffer);
      if (read !== buffer.byteLength) {
        throw new Error(ERRORS.BUFF_UNDERFLOW);
      }

      // Construct filter from buffer:
      return [new BloomFilter(buffer, nHashes), dbVersion];
    } finally {
      fStream.close();
    }
  },

  /**
   * @param {BloomFilter} filter - bloom filter to save to file.
   * @param {int} version - database version.
   * @param {nsIFile} file - pointer to the bloom filter data file.
   */
  saveToFile(filter, version, file) {
    const foStream = Components.classes['@mozilla.org/network/file-output-stream;1']
      .createInstance(Components.interfaces.nsIFileOutputStream);
    const openFlags = FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE |
        FileUtils.MODE_TRUNCATE;
    const permFlags = 0o0666;
    foStream.init(file, openFlags, permFlags, 0);
    try {
      const binStream = Components.classes['@mozilla.org/binaryoutputstream;1']
        .createInstance(Components.interfaces.nsIBinaryOutputStream);
      binStream.setOutputStream(foStream);

      // Write header:
      binStream.write32(HEAD_SIG);
      binStream.write8(FORMAT_VERSION);
      binStream.write16(version);
      binStream.write8(filter.nHashes);

      // Write filter data:
      const buffer = new Uint8Array(filter.rawData);
      binStream.writeByteArray(buffer, buffer.byteLength);
    } finally {
      foStream.close();
    }
  }
}; // BloomFilterUtils
