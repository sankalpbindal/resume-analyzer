import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdf = require('pdf-parse')
    const data = await pdf(buffer)
    return NextResponse.json({ text: data.text })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}