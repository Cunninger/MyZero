import traceback

from fastapi import APIRouter, HTTPException

from app.schemas import LatexConvertRequest, LatexConvertResponse, MermaidGenerateRequest, MermaidGenerateResponse
from app.services.tool_service import tool_service

router = APIRouter(prefix="/tools", tags=["tools"])


@router.post("/latex-convert", response_model=LatexConvertResponse)
async def latex_convert(request: LatexConvertRequest):
    """Convert text to LaTeX code."""
    try:
        result = await tool_service.convert_to_latex(
            text=request.text,
            template=request.template,
            language=request.language
        )
        return LatexConvertResponse(**result)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"LaTeX conversion failed: {str(e)}")


@router.post("/mermaid-generate", response_model=MermaidGenerateResponse)
async def mermaid_generate(request: MermaidGenerateRequest):
    """Generate Mermaid diagram from description."""
    try:
        result = await tool_service.generate_mermaid(
            description=request.description,
            diagram_type=request.diagram_type,
            language=request.language
        )
        return MermaidGenerateResponse(**result)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Mermaid generation failed: {str(e)}")
