#!/usr/bin/env python3
import argparse
import csv
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def read_relationships(zf):
    rels = {}
    try:
        xml = zf.read("word/_rels/document.xml.rels")
    except KeyError:
        return rels
    root = ET.fromstring(xml)
    for rel in root.findall("rel:Relationship", NS):
        rel_id = rel.attrib.get("Id")
        target = rel.attrib.get("Target")
        if rel_id and target:
            rels[rel_id] = target
    return rels


def paragraph_text(paragraph, rels):
    chunks = []
    for child in paragraph:
        tag = child.tag.split("}", 1)[-1]
        if tag == "hyperlink":
            rel_id = child.attrib.get(f"{{{NS['r']}}}id")
            text = "".join(t.text or "" for t in child.findall(".//w:t", NS))
            if text and rel_id in rels:
                chunks.append(f"[{text}]({rels[rel_id]})")
            else:
                chunks.append(text)
        elif tag == "r":
            chunks.append("".join(t.text or "" for t in child.findall(".//w:t", NS)))
    return "".join(chunks).strip()


def extract_docx(path):
    with zipfile.ZipFile(path) as zf:
        rels = read_relationships(zf)
        root = ET.fromstring(zf.read("word/document.xml"))
    paragraphs = []
    for paragraph in root.findall(".//w:p", NS):
        text = paragraph_text(paragraph, rels)
        if text:
            paragraphs.append(text)
    return paragraphs


def clean_title(text):
    text = re.sub(r"^#+\s*", "", text).strip()
    return text or "Untitled"


def slugify(name):
    value = name.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "untitled"


def markdown_for(source_docx, paragraphs):
    title = clean_title(paragraphs[0]) if paragraphs else source_docx.stem
    lines = [
        "---",
        f"title: {title}",
        f"source_pages_file: {source_docx.stem}.pages",
        f"source_docx_file: {source_docx.name}",
        "extraction_method: Pages export to Microsoft Word, then XML text extraction",
        "---",
        "",
    ]
    for paragraph in paragraphs:
        lines.append(paragraph)
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def summarize(source_docx, md_path, paragraphs):
    body = "\n".join(paragraphs)
    words = re.findall(r"\b[\w'-]+\b", body)
    links = re.findall(r"https?://[^\s)]+", body)
    headings = [p for p in paragraphs if p.startswith("#")][:12]
    return {
        "source_docx": source_docx.name,
        "markdown_file": md_path.name,
        "title": clean_title(paragraphs[0]) if paragraphs else "",
        "paragraph_count": len(paragraphs),
        "word_count": len(words),
        "link_count": len(links),
        "first_headings": " | ".join(headings),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--docx-dir", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--audit", required=True)
    args = parser.parse_args()

    docx_dir = Path(args.docx_dir)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    audit_path = Path(args.audit)
    audit_path.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    for source_docx in sorted(docx_dir.glob("*.docx")):
        paragraphs = extract_docx(source_docx)
        md_name = slugify(source_docx.stem) + ".md"
        md_path = out_dir / md_name
        md_path.write_text(markdown_for(source_docx, paragraphs), encoding="utf-8")
        rows.append(summarize(source_docx, md_path, paragraphs))

    with audit_path.open("w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "source_docx",
            "markdown_file",
            "title",
            "paragraph_count",
            "word_count",
            "link_count",
            "first_headings",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()

